import json
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.services.llm_service import chat_with_llm, SYSTEM_PROMPT
from app.services.conversation_service import save_message, get_conversation, list_user_conversations
from app.services.icp_service import update_icp
from app.services.search_service import search_icp
from app.services.prospect_service import save_prospect_list  # ✅ NEW
from app.db.collections import get_conversations_collection
from app.routes.auth import get_current_user  # ✅ Protect with auth

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    conversation_id: str | None = None
    prompt: str

# ======================= Chat Endpoint =======================

@router.post("/")
def chat(req: ChatRequest, user=Depends(get_current_user)):
    conversations = get_conversations_collection()

    # Generate new conversation_id if missing
    conversation_id = req.conversation_id or str(uuid.uuid4())

    # Load history for this user only
    conv = conversations.find_one({
        "conversation_id": conversation_id,
        "user_id": str(user["_id"])
    })

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if conv and "messages" in conv:
        for m in conv["messages"]:
            role = "assistant" if m["sender"] == "assistant" else "user"
            messages.append({"role": role, "content": m["message_text"]})

    # Add new user input
    messages.append({"role": "user", "content": req.prompt})

    # Get GPT reply
    reply = chat_with_llm(messages)

    # Save user + assistant messages
    save_message(conversation_id, "user", req.prompt, user_id=str(user["_id"]))
    save_message(conversation_id, "assistant", reply, user_id=str(user["_id"]))

    # Extract ICP JSON if present
    search_results = None
    prospect_list_id = None
    match = re.search(r"<icp_json>(.*?)</icp_json>", reply, re.DOTALL)
    if match:
        try:
            icp_data = json.loads(match.group(1).strip())
            icp_data["user_id"] = str(user["_id"])
            update_icp(conversation_id, icp_data)

            # ✅ Run search immediately
            search_results = search_icp(icp_data, str(user["_id"]))

            # ✅ Save prospect list with unique ID
            saved = save_prospect_list(str(user["_id"]), conversation_id, icp_data, search_results)
            prospect_list_id = saved["prospect_list_id"]

        except Exception as e:
            print(f"⚠️ Error parsing ICP JSON: {e}")

        # Strip JSON before sending back to user
        reply = re.sub(r"<icp_json>.*?</icp_json>", "", reply, flags=re.DOTALL).strip()

    return {
        "reply": reply,
        "conversation_id": conversation_id,
        "user_id": str(user["_id"]),
        "results": search_results,       # ✅ matched companies & people
        "prospect_list_id": prospect_list_id  # ✅ new ID for saved list
    }

# ======================= History Endpoints =======================

@router.get("/history/{conversation_id}")
def get_chat_history(conversation_id: str, user=Depends(get_current_user)):
    conv = get_conversation(conversation_id, str(user["_id"]))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or not yours")

    conv["_id"] = str(conv["_id"])
    return conv

@router.get("/history")
def list_user_chats(user=Depends(get_current_user)):
    conversations = list_user_conversations(str(user["_id"]))
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    return conversations

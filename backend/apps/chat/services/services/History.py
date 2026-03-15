from langgraph.checkpoint.base import BaseCheckpointSaver,CheckpointTuple,Checkpoint,CheckpointMetadata
from typing import Optional,Iterator,Sequence, Any
from langchain_core.runnables import RunnableConfig


class History(BaseCheckpointSaver):
    def __init__(self):
        super().__init__()
        self.storage={}

    async def aget_tuple(self,config:dict)->Optional[CheckpointTuple]:
        """
        Called automatically by LangGraph before every invoke.
        Loads the saved checkpoint for this thread_id.
        Return None if no history exists (fresh conversation).
        """
        # print("config\n\n\n",config)
        thread_id=config['configurable']['thread_id']
        if thread_id not in self.storage:
            return None

        saved=self.storage[thread_id]
        checkpoint=CheckpointTuple(
            config=config,
            checkpoint=self.storage[thread_id],
            metadata={"step": self.storage[thread_id].get("step", 0)},
            parent_config={
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_id": saved.get("parent_checkpoint_id")
            }
        } if saved.get("parent_checkpoint_id") else None
        )
        return checkpoint

    async def aput(self,config:dict,checkpoint:Checkpoint , metadata:CheckpointMetadata,new_versions)->dict:
        """
        called after every node is executed automatically
        by langchain
        """
        thread_id=config['configurable']['thread_id']
        if thread_id in self.storage:
            checkpoint["parent_checkpoint_id"] = self.storage[thread_id].get("id")

        checkpoint['step']=metadata.get('step',0)
        self.storage[thread_id]=checkpoint
        # print("checkpoint\n\n\n",checkpoint)

        if checkpoint.get("channel_values",{}).get("final_result",0):
            pass
            # print("final_result\n\n\n",checkpoint['channel_values']['final_result'])
        return config

    async def aput_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        """Store intermediate writes linked to a checkpoint.

        Args:
            config: Configuration of the related checkpoint.
            writes: List of writes to store.
            task_id: Identifier for the task creating the writes.
            task_path: Path of the task creating the writes.

        Raises:
            NotImplementedError: Implement this method in your custom checkpoint saver.
        """
        pass









































# from langchain_core.chat_history import BaseChatMessageHistory
# from langchain_core.messages import BaseMessage

# class BufferWindowMessageHistory(BaseChatMessageHistory):
#     def __init__(self, k: int = 4):
     
#         self.messages: list[BaseMessage] = []
#         self.k = k

#     def add_messages(self, messages: list[BaseMessage]) -> None:
#         """Add new messages and keep only the last `k`."""
#         self.messages.extend(messages)
#         self.messages = self.messages[-self.k:]

#     async def aadd_messages(self, messages: list[BaseMessage]) -> None:
#         """Async version: Add new messages and keep only the last `k`."""
#         self.messages.extend(messages)
#         self.messages = self.messages[-self.k:]

#     def clear(self) -> None:
#         """Clear the history."""
#         self.messages = []

#     async def aclear(self) -> None:
#         """Async version: Clear the history."""
#         self.messages = []
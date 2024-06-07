/* eslint-disable prettier/prettier */
import { cn } from "@nextui-org/theme";

type Props = {
  position?: "left" | "right";
  message: string;
  sender: string;
};

export default function ChatBubble({
  position = "left",
  message,
  sender,
}: Props) {
  return (
    <div
      className={cn("py-1 px-3 rounded-2xl w-fit bg-green-600 ", {
        "bg-slate-600 self-end": position === "right",
      })}
    >
      <div className="text-xs font-bold text-violet-100">{sender}</div>
      <p className="text-white">{message}</p>
    </div>
  );
}

import { CircleCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

    return <span style={{ display: "inline-block", position: "relative", width: 20, height: 20 }}>
        <button
            type="button"
            onClick={handleCopy}
            style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                position: "absolute",
                width: "100%",
                height: "100%",
            }}
            aria-label={copied ? "Copied" : "Copy"}
        >
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: copied ? 0 : 1,
                    transition: "opacity 0.3s",
                    }}
            >
                <Image src="/copy.svg" alt="" width={10} height={10} />
            </span>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: copied ? 1 : 0,
                    transition: "opacity 0.3s",
                }}
            >
                <CircleCheck size={16} className="text-gray-500" />
            </span>
        </button>
    </span>
}
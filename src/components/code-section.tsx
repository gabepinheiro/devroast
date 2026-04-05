"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

function CodeSection() {
  const [hasCode, setHasCode] = useState(false);

  return (
    <>
      <CodeEditor onChange={(code) => setHasCode(code.trim().length > 0)} />

      <div className="flex w-full max-w-editor items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle label="roast mode" defaultChecked />
          <span className="font-plex text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>
        <Button variant="primary" size="lg" disabled={!hasCode}>
          $ roast_my_code
        </Button>
      </div>
    </>
  );
}

export { CodeSection };

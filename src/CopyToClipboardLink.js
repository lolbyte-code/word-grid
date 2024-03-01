import React, { useState } from "react";
import copy from "clipboard-copy";

const CopyToClipboardLink = ({ link }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await copy(link);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div>
      <a
        className="game-link"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {`${link.substr(0, 26)}${link.length > 26 ? "..." : ""}`}
      </a>
      <button className="game-link-button" onClick={handleCopyToClipboard}>
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

export default CopyToClipboardLink;
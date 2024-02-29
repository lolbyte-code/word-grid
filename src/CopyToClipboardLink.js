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
      }, 2000); // Reset "Copied" status after 2 seconds
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div className="link-container">
      <a
        className="game-link"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link}
      </a>
      <button className="game-link" onClick={handleCopyToClipboard}>
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

export default CopyToClipboardLink;

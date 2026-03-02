(function () {
  function getTextarea() {
    return document.getElementById("agent-content");
  }

  function getStatusEl() {
    return document.getElementById("editor-status");
  }

  function setStatus(message, type) {
    const statusEl = getStatusEl();
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-success");
    if (type) {
      statusEl.classList.add(type);
    }
  }

  function autoResize(textarea) {
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleTabInsert(event) {
    if (event.key !== "Tab") {
      return;
    }
    event.preventDefault();
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = `${value.substring(0, start)}  ${value.substring(end)}`;
    textarea.selectionStart = textarea.selectionEnd = start + 2;
  }

  window.loadContent = function (content) {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    textarea.value = content || "";
    autoResize(textarea);
  };

  window.getContent = function () {
    const textarea = getTextarea();
    return textarea ? textarea.value : "";
  };

  window.handleSave = function () {
    const saveButton = document.getElementById("save-btn");
    if (!saveButton) {
      return;
    }

    saveButton.addEventListener("click", async function () {
      if (!window.__toeState || !window.__toeState.selectedId) {
        setStatus("Select an agent before saving.", "is-error");
        return;
      }

      const content = window.getContent();
      saveButton.disabled = true;
      setStatus("Saving...", null);

      const result = await window.saveAgent(window.__toeState.selectedId, content);

      saveButton.disabled = false;
      if (result.ok) {
        setStatus("Saved.", "is-success");
        return;
      }

      setStatus(result.error || "Unable to save.", "is-error");
    });
  };

  window.setAgentInfo = function (agent) {
    const nameEl = document.getElementById("agent-name");
    if (nameEl) {
      nameEl.textContent = agent.name || "Agent";
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    const textarea = getTextarea();
    if (textarea) {
      textarea.addEventListener("input", function () {
        autoResize(textarea);
      });
      textarea.addEventListener("keydown", handleTabInsert);
    }
    window.handleSave();
  });
})();

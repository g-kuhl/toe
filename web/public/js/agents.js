(function () {
  const state = {
    agents: [],
    filteredAgents: [],
    selectedId: null,
  };

  window.__toeState = state;

  function setSidebarStatus(message, type) {
    const statusEl = document.getElementById("sidebar-status");
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success");
    if (type) {
      statusEl.classList.add(type);
    }
  }

  function setEditorVisibility(showEditor) {
    const emptyEl = document.getElementById("editor-empty");
    const contentEl = document.getElementById("editor-content");
    if (!emptyEl || !contentEl) {
      return;
    }
    if (showEditor) {
      emptyEl.classList.add("is-hidden");
      contentEl.classList.remove("is-hidden");
    } else {
      emptyEl.classList.remove("is-hidden");
      contentEl.classList.add("is-hidden");
    }
  }

  function parseFrontmatter(content) {
    const result = {
      frontmatter: {},
      body: content || "",
    };

    if (!content) {
      return result;
    }

    const lines = content.split("\n");
    if (lines[0].trim() !== "---") {
      return result;
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i += 1) {
      if (lines[i].trim() === "---") {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return result;
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);
    result.body = bodyLines.join("\n").trimStart();

    let currentKey = null;
    frontmatterLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }
      const listMatch = trimmed.match(/^[-]\s+(.*)$/);
      if (listMatch && currentKey) {
        const value = listMatch[1].trim();
        if (!Array.isArray(result.frontmatter[currentKey])) {
          result.frontmatter[currentKey] = [];
        }
        result.frontmatter[currentKey].push(value);
        return;
      }

      const pairMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (pairMatch) {
        const key = pairMatch[1];
        const value = pairMatch[2];
        if (value === "") {
          result.frontmatter[key] = [];
          currentKey = key;
        } else {
          result.frontmatter[key] = value;
          currentKey = key;
        }
      }
    });

    return result;
  }

  function renderFrontmatter(frontmatter) {
    const tableBody = document.getElementById("frontmatter-table");
    if (!tableBody) {
      return;
    }

    const keys = [
      "name",
      "description",
      "user-invokable",
      "target",
      "model",
      "tools",
      "agents",
    ];

    tableBody.innerHTML = "";
    keys.forEach((key) => {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      keyCell.className = "fm-key";
      keyCell.textContent = key;

      const valueCell = document.createElement("td");
      valueCell.className = "fm-value";

      let value = frontmatter[key];
      if (Array.isArray(value)) {
        value = value.length ? value.join(", ") : "—";
      }
      if (value === undefined || value === null || value === "") {
        value = "—";
      }

      valueCell.textContent = String(value);
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      tableBody.appendChild(row);
    });
  }

  function updateActionButtons(agent) {
    const toggleButton = document.getElementById("toggle-btn");
    if (toggleButton) {
      toggleButton.textContent = agent.enabled ? "Disable" : "Enable";
    }
  }

  function createAgentListItem(agent) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "agent-list-item";
    button.dataset.agentId = agent.id;

    const nameSpan = document.createElement("span");
    nameSpan.className = "agent-name";
    nameSpan.textContent = agent.name;

    const badge = document.createElement("span");
    badge.className = `badge ${agent.enabled ? "badge--enabled" : "badge--disabled"}`;
    badge.textContent = agent.enabled ? "enabled" : "disabled";

    button.appendChild(nameSpan);
    button.appendChild(badge);

    button.addEventListener("click", function () {
      window.selectAgent(agent.id);
    });

    return button;
  }

  function renderAgentList(agents) {
    const listEl = document.getElementById("agent-list");
    if (!listEl) {
      return;
    }

    listEl.innerHTML = "";
    if (!agents.length) {
      const empty = document.createElement("p");
      empty.className = "status-message";
      empty.textContent = "No agents found.";
      listEl.appendChild(empty);
      return;
    }

    agents.forEach((agent) => {
      const item = createAgentListItem(agent);
      if (agent.id === state.selectedId) {
        item.classList.add("is-active");
      }
      listEl.appendChild(item);
    });
  }

  function setActiveListItem(id) {
    const listEl = document.getElementById("agent-list");
    if (!listEl) {
      return;
    }

    Array.from(listEl.querySelectorAll(".agent-list-item")).forEach((item) => {
      item.classList.toggle("is-active", item.dataset.agentId === id);
    });
  }

  function updateSidebarItem(agent) {
    const listEl = document.getElementById("agent-list");
    if (!listEl) {
      return;
    }

    const item = listEl.querySelector(`[data-agent-id="${agent.id}"]`);
    if (!item) {
      return;
    }

    const badge = item.querySelector(".badge");
    if (badge) {
      badge.className = `badge ${agent.enabled ? "badge--enabled" : "badge--disabled"}`;
      badge.textContent = agent.enabled ? "enabled" : "disabled";
    }
  }

  function filterAgents(term) {
    const query = term.trim().toLowerCase();
    if (!query) {
      state.filteredAgents = state.agents.slice();
    } else {
      state.filteredAgents = state.agents.filter((agent) =>
        agent.name.toLowerCase().includes(query)
      );
    }
    renderAgentList(state.filteredAgents);
  }

  window.loadAgentList = async function () {
    setSidebarStatus("Loading agents...", null);
    const result = await window.getAgents();
    if (!result.ok) {
      setSidebarStatus(result.error || "Unable to load agents.", "is-error");
      return;
    }

    state.agents = result.data && result.data.agents ? result.data.agents : [];
    state.filteredAgents = state.agents.slice();
    renderAgentList(state.filteredAgents);
    setSidebarStatus("", null);

    if (!state.selectedId && state.agents.length) {
      window.selectAgent(state.agents[0].id);
    } else if (!state.agents.length) {
      setEditorVisibility(false);
    }
  };

  window.selectAgent = async function (id) {
    if (!id) {
      return;
    }

    setSidebarStatus("Loading agent...", null);
    setActiveListItem(id);
    const result = await window.getAgent(id);
    if (!result.ok) {
      setSidebarStatus(result.error || "Unable to load agent.", "is-error");
      return;
    }

    const agent = result.data;
    state.selectedId = agent.id;
    setEditorVisibility(true);
    window.setAgentInfo(agent);

    const parsed = parseFrontmatter(agent.content);
    renderFrontmatter(parsed.frontmatter);
    window.loadContent(parsed.body);
    updateActionButtons(agent);
    setActiveListItem(agent.id);
    setSidebarStatus("", null);
  };

  window.handleToggle = function () {
    const toggleButton = document.getElementById("toggle-btn");
    if (!toggleButton) {
      return;
    }

    toggleButton.addEventListener("click", async function () {
      if (!state.selectedId) {
        return;
      }

      const previousId = state.selectedId;
      toggleButton.disabled = true;
      const result = await window.toggleAgent(previousId);
      toggleButton.disabled = false;

      if (!result.ok) {
        setSidebarStatus(result.error || "Unable to toggle agent.", "is-error");
        return;
      }

      const updated = result.data;
      state.selectedId = updated.id;

      state.agents = state.agents.map((agent) =>
        agent.id === previousId
          ? { ...agent, id: updated.id, enabled: updated.enabled }
          : agent
      );
      state.filteredAgents = state.filteredAgents.map((agent) =>
        agent.id === previousId
          ? { ...agent, id: updated.id, enabled: updated.enabled }
          : agent
      );

      const listEl = document.getElementById("agent-list");
      if (listEl) {
        const activeItem = listEl.querySelector(".agent-list-item.is-active");
        if (activeItem) {
          activeItem.dataset.agentId = updated.id;
          const badge = activeItem.querySelector(".badge");
          if (badge) {
            badge.className = `badge ${updated.enabled ? "badge--enabled" : "badge--disabled"}`;
            badge.textContent = updated.enabled ? "enabled" : "disabled";
          }
        }
      }

      updateActionButtons(updated);
      setSidebarStatus("", null);
    });
  };

  window.handleDelete = function () {
    const deleteButton = document.getElementById("delete-btn");
    if (!deleteButton) {
      return;
    }

    deleteButton.addEventListener("click", async function () {
      if (!state.selectedId) {
        return;
      }

      const current = state.agents.find((agent) => agent.id === state.selectedId);
      const name = current ? current.name : "this agent";
      const confirmed = window.confirm(`Delete '${name}'? This cannot be undone.`);
      if (!confirmed) {
        return;
      }

      deleteButton.disabled = true;
      const result = await window.deleteAgent(state.selectedId);
      deleteButton.disabled = false;

      if (!result.ok) {
        setSidebarStatus(result.error || "Unable to delete agent.", "is-error");
        return;
      }

      state.agents = state.agents.filter((agent) => agent.id !== state.selectedId);
      state.filteredAgents = state.filteredAgents.filter(
        (agent) => agent.id !== state.selectedId
      );
      state.selectedId = null;
      renderAgentList(state.filteredAgents);
      setEditorVisibility(false);
      setSidebarStatus("Agent deleted.", "is-success");
    });
  };

  window.handleRename = function () {
    const renameButton = document.getElementById("rename-btn");
    if (!renameButton) {
      return;
    }

    renameButton.addEventListener("click", function () {
      if (!state.selectedId) {
        return;
      }

      const listEl = document.getElementById("agent-list");
      if (!listEl) {
        return;
      }

      const item = listEl.querySelector(".agent-list-item.is-active");
      if (!item) {
        return;
      }

      const nameSpan = item.querySelector(".agent-name");
      if (!nameSpan) {
        return;
      }

      const currentName = nameSpan.textContent;
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentName || "";
      input.className = "agent-name-input";

      item.replaceChild(input, nameSpan);
      input.focus();
      input.select();

      const cleanup = () => {
        if (item.contains(input)) {
          item.replaceChild(nameSpan, input);
        }
      };

      const confirmRename = async () => {
        const newName = input.value.trim();
        if (!newName || newName === currentName) {
          cleanup();
          return;
        }

        const previousId = state.selectedId;
        const result = await window.renameAgent(previousId, newName);
        if (!result.ok) {
          setSidebarStatus(result.error || "Unable to rename agent.", "is-error");
          cleanup();
          return;
        }

        const updated = result.data;
        state.selectedId = updated.id;
        nameSpan.textContent = updated.name;
        item.dataset.agentId = updated.id;
        setActiveListItem(updated.id);
        window.setAgentInfo(updated);

        state.agents = state.agents.map((agent) =>
          agent.id === previousId
            ? { ...agent, id: updated.id, name: updated.name }
            : agent
        );
        state.filteredAgents = state.filteredAgents.map((agent) =>
          agent.id === previousId
            ? { ...agent, id: updated.id, name: updated.name }
            : agent
        );

        cleanup();
      };

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          confirmRename();
        } else if (event.key === "Escape") {
          cleanup();
        }
      });

      input.addEventListener("blur", function () {
        cleanup();
      });
    });
  };

  window.handleNewAgent = function () {
    const newAgentButton = document.getElementById("new-agent-btn");
    if (!newAgentButton) {
      return;
    }

    newAgentButton.addEventListener("click", async function () {
      const name = window.prompt("Name for the new agent:");
      if (!name) {
        return;
      }

      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      newAgentButton.disabled = true;
      const result = await window.createAgent(trimmed);
      newAgentButton.disabled = false;

      if (!result.ok) {
        setSidebarStatus(result.error || "Unable to create agent.", "is-error");
        return;
      }

      const created = result.data;
      state.agents.unshift({
        id: created.id,
        name: created.name,
        enabled: created.enabled,
      });
      filterAgents(document.getElementById("search-input").value || "");
      window.selectAgent(created.id);
    });
  };

  function initSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) {
      return;
    }

    searchInput.addEventListener("input", function () {
      filterAgents(searchInput.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("agent-list")) {
      return;
    }

    window.loadAgentList();
    window.handleToggle();
    window.handleDelete();
    window.handleRename();
    window.handleNewAgent();
    initSearch();
  });
})();

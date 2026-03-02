(function () {
  async function request(path, options) {
    const fetchOptions = options || {};
    fetchOptions.credentials = "include";

    const hasBody = fetchOptions.body !== undefined;
    if (hasBody && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.headers = fetchOptions.headers || {};
      if (!fetchOptions.headers["Content-Type"]) {
        fetchOptions.headers["Content-Type"] = "application/json";
      }
      if (typeof fetchOptions.body !== "string") {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }
    }

    let response;
    try {
      response = await fetch(path, fetchOptions);
    } catch (error) {
      return { ok: false, status: 0, error: "Network error" };
    }

    if (response.status === 401 && path !== "/api/login") {
      window.location.href = "/";
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }
    }

    if (!response.ok) {
      const message = data && data.error ? data.error : "Request failed";
      return { ok: false, status: response.status, error: message };
    }

    return { ok: true, status: response.status, data: data };
  }

  window.getAgents = function () {
    return request("/api/agents", { method: "GET" });
  };

  window.getAgent = function (id) {
    return request(`/api/agents/${id}`, { method: "GET" });
  };

  window.saveAgent = function (id, content) {
    return request(`/api/agents/${id}`, {
      method: "PUT",
      body: { content: content },
    });
  };

  window.toggleAgent = function (id) {
    return request(`/api/agents/${id}/toggle`, { method: "PATCH" });
  };

  window.renameAgent = function (id, newName) {
    return request(`/api/agents/${id}/rename`, {
      method: "PATCH",
      body: { newName: newName },
    });
  };

  window.deleteAgent = function (id) {
    return request(`/api/agents/${id}`, { method: "DELETE" });
  };

  window.createAgent = function (name) {
    return request("/api/agents", {
      method: "POST",
      body: { name: name },
    });
  };

  window.login = function (username, password) {
    return request("/api/login", {
      method: "POST",
      body: { username: username, password: password },
    });
  };

  window.logout = function () {
    return request("/api/logout", { method: "POST" });
  };
})();

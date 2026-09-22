(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-nav]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });
  }

  document.querySelectorAll("[data-folder-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var folder = button.closest(".nav-folder");
      var open = folder.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest(".nav-folder")) return;
    document.querySelectorAll(".nav-folder.is-open").forEach(function (folder) {
      folder.classList.remove("is-open");
      var button = folder.querySelector("[data-folder-toggle]");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (panel && panel.classList.contains("is-open")) {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      toggle.focus();
    }
  });

  document.querySelectorAll("[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!window.fetch) return;
      event.preventDefault();
      var wrap = form.closest(".form-wrap");
      var status = wrap ? wrap.querySelector("[data-form-status]") : null;
      var button = form.querySelector("[type=submit]");
      if (button) button.disabled = true;
      if (status) {
        status.hidden = false;
        status.classList.remove("error");
        status.textContent = "Sending…";
      }
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) throw new Error(result.data.error || "Unable to send that right now.");
          form.hidden = true;
          if (status) status.textContent = result.data.message;
        })
        .catch(function (err) {
          if (status) {
            status.classList.add("error");
            status.textContent = err.message || "Unable to send that right now.";
          }
          if (button) button.disabled = false;
        });
    });
  });
})();

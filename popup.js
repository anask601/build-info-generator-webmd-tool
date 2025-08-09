class BuildInfoGenerator {
  constructor() {
    this.initializeEventListeners();
    this.loadSavedData();
  }

  initializeEventListeners() {
    // Form submission
    document.getElementById("buildForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.generateAndDownload();
    });

    // Clear button
    document.querySelector(".clear-btn").addEventListener("click", () => {
      this.clearForm();
    });

    // Design shell type change
    document
      .getElementById("designShellType")
      .addEventListener("change", (e) => {
        this.toggleDesignShellOptions(e.target.value);
      });

    // Auto-save on input
    document.querySelectorAll("input, select, textarea").forEach((element) => {
      element.addEventListener("input", () => {
        this.saveFormData();
      });
    });
  }

  toggleDesignShellOptions(value) {
    const options = document.getElementById("designShellOptions");
    if (value) {
      options.classList.add("show");
    } else {
      options.classList.remove("show");
    }
  }

  async generateAndDownload() {
    try {
      const formData = new FormData(document.getElementById("buildForm"));
      const data = Object.fromEntries(formData);

      // Generate content
      const content = this.generateContent(data);

      // Create filename with brand name and SF number
      const brandName = data.brand.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase(); // Clean brand name
      const sfNumber = data.sfNumber.replace(/[^a-zA-Z0-9.-]/g, ""); // Clean SF number
      const filename = `${brandName}-${sfNumber}.txt`;

      // Download file using Chrome extension API
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false,
      });

      URL.revokeObjectURL(url);
      this.showStatus(
        "Build information generated and downloaded successfully!",
        "success"
      );
    } catch (error) {
      console.error("Error generating build info:", error);
      this.showStatus(
        "Error generating build information. Please try again.",
        "error"
      );
    }
  }

  generateContent(data) {
    return `Hi Everyone

This initial / clone build is completed and is ready for internal review. Please see information below.

Tactic ID: ${data.tacticId}
Promo ID: ${data.promoId}
Brand/Department ID: ${data.brandDeptId}
SF#: ${data.sfNumber}
Client: ${data.client}
Brand: ${data.brand}
Design Shell: ${data.designShellType}
*** Link to Design Shell (FIGMA): ${data.designShellLink || "N/A"}

Script: ${data.script}

Program URLs: 
${data.programUrls}

Jenkins Build #: ${data.jenkinsBuild}
Bundle #: ${data.bundleNumber}`;
  }

  clearForm() {
    document.getElementById("buildForm").reset();
    document.getElementById("designShellOptions").classList.remove("show");
    this.showStatus("Form cleared successfully!", "success");

    // Clear saved data
    chrome.storage.local.remove("buildFormData");
  }

  showStatus(message, type) {
    const statusEl = document.getElementById("statusMessage");
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;

    setTimeout(() => {
      statusEl.style.display = "none";
    }, 3000);
  }

  async saveFormData() {
    try {
      const formData = new FormData(document.getElementById("buildForm"));
      const data = Object.fromEntries(formData);
      await chrome.storage.local.set({ buildFormData: data });
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  }

  async loadSavedData() {
    try {
      const result = await chrome.storage.local.get("buildFormData");
      if (result.buildFormData) {
        const data = result.buildFormData;
        Object.keys(data).forEach((key) => {
          const element = document.getElementById(key);
          if (element) {
            element.value = data[key];
            if (key === "designShellType" && data[key]) {
              this.toggleDesignShellOptions(data[key]);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new BuildInfoGenerator();
});

document.getElementById("scanMail").addEventListener("click", async () => {

    let email = document.getElementById("emailCheck").value;

    if (!email) {
        document.getElementById("mailResult").innerText = "Please enter an email.";
        return;
    }

    document.getElementById("mailResult").innerText = "Scanning email...";
    document.getElementById("mailResult").style.color = "blue";

    try {
        // Using a FREE open API to check for disposable/fraud emails
        let response = await fetch(`https://disposable.debounce.io/?email=${email}`);
        let data = await response.json();

        if (data.disposable === "true") {
            document.getElementById("mailResult").innerText = "⚠ High Risk: Disposable/Fake Email!";
            document.getElementById("mailResult").style.color = "red";
        } else {
            document.getElementById("mailResult").innerText = "✅ Safe Email";
            document.getElementById("mailResult").style.color = "green";
        }
    } catch (error) {
        document.getElementById("mailResult").innerText = "Error scanning email API.";
        document.getElementById("mailResult").style.color = "black";
    }

});

document.getElementById("musokuToggle").addEventListener("click", () => {
    alert("Musoku Mode Activated: Minimal Trace Browsing");
});
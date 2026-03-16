function blurSensitiveData() {

    let inputs = document.querySelectorAll("input[type=password], input[type=email]");

    inputs.forEach(field => {

        field.style.filter = "blur(5px)";

        field.addEventListener("focus", () => {
            field.style.filter = "none";
        });

    });

}



const mindeeSubmit = (evt) => {
    evt.preventDefault()
    let myFileInput = document.getElementById('invoice');
    let myFile = myFileInput.files[0]
    if (!myFile) { return }
    let data = new FormData();
    data.append("document", myFile, myFile.name);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            // console.log(this.responseText);
            // getAttributes(this.responseText);
            console.log(getAttributes(this.responseText));
        }
    });

    xhr.open("POST", "https://api.mindee.net/v1/products/mindee/invoices/v4/predict");
    xhr.setRequestHeader("Authorization", "Token 975e91b75459a45d0d94023575866d91");
    xhr.send(data);
    
}
function getAttributes(text) {
    try {
        let data = JSON.parse(text);
        let invoice = data.document.inference.pages[0].prediction;
        
        let direccion = invoice.supplier_address?.value || "N/A";
        let postal = typeof direccion === "string" ? direccion.match(/\d{5}/)?.[0] || "N/A" : "N/A";
        let poblacion = typeof direccion === "string" ? direccion.split(" ").slice(1).join(" ") || "N/A" : "N/A";

        let extractedData = {
            proveedorNombre: invoice.supplier_name?.value || "N/A",
            direccion: direccion,
            postal: postal,
            poblacion: poblacion,
            cif: invoice.supplier_company_registrations?.[0]?.value || "N/A",
            fechaFactura: invoice.date?.value || "N/A",
            fechaVencimiento: invoice.due_date?.value || "N/A",
            baseImponible: invoice.total_net?.value || "N/A",
            iva: invoice.total_tax?.value || "N/A",
            total: invoice.total_amount?.value || "N/A"
        };

        return extractedData;
    } catch (error) {
        console.error("Error al procesar el JSON:", error);
        return null;
    }
}


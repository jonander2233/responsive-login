const mindeeSubmit = (evt) => {
    evt.preventDefault();
    let myFileInput = document.getElementById('invoice');
    let myFile = myFileInput.files[0];
    if (!myFile) { return; }
    let data = new FormData();
    data.append("document", myFile, myFile.name);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            getAttributes(this.responseText);
        }
    });

    xhr.open("POST", "https://api.mindee.net/v1/products/mindee/invoices/v4/predict");
    xhr.setRequestHeader("Authorization", "Token 975e91b75459a45d0d94023575866d91");
    xhr.send(data);
}



async function getAttributes(text) {
    try {
        let data = JSON.parse(text);
        let invoice = data.document.inference.pages[0].prediction;

        let direccion = invoice.supplier_address?.value || "";
        let postal = typeof direccion === "string" ? direccion.match(/\d{5}/)?.[0] || "" : "";
        let poblacion = typeof direccion === "string" ? direccion.split(" ").slice(1).join(" ") || "" : "";

        let extractedData = {
            "value": [
                {
                    "ID": 3,
                    "VendorNo": "40000",
                    "VendorName": invoice.supplier_name?.value || "",
                    "VendorAddress": direccion,
                    "VendorPostalCode": postal,
                    "VendorCity": poblacion,
                    "VendorCIF": invoice.supplier_company_registrations?.[0]?.value || "",
                    "InvoiceDate": invoice.date?.value || "",
                    "DueDate": invoice.due_date?.value || "",
                    "BaseAmount": invoice.total_net?.value || 0,
                    "VATAmount": invoice.total_tax?.value || 0,
                    "TotalAmount": invoice.total_amount?.value || 0,
                    "InvoiceNo": "250",
                    "Status": "Processed"
                }
            ]
        };

        let token = await getToken();  // ⬅️ ESPERA a obtener el token antes de llamar a sendDataToMicrosoft
        if (!token) {
            console.error("Error: No se pudo obtener el token.");
            return;
        }

        console.log("Datos a enviar:", extractedData);
        sendDataToMicrosoft(extractedData, token);
    } catch (error) {
        console.error("Error al procesar el JSON:", error);
    }
}



async function getToken() {
    try {
        let response = await fetch('http://localhost:3000/getAzureToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener el token: ${response.statusText}`);
        }

        let result = await response.json();
        console.log("Token obtenido:", result.token);
        return result.token;  // ⬅️ Asegúrate de devolver el token
    } catch (error) {
        console.error("Error al obtener el token:", error);
        return null;
    }
}



async function sendDataToMicrosoft(data, token) {
    if (!token) {
        console.error("Token inválido. No se enviarán datos a Microsoft.");
        return;
    }

    let url = "https://api.businesscentral.dynamics.com/v2.0/c4047ea2-d3da-44e9-9938-a732a6f96b47/proyecto/ODataV4/Company('CRONUS%20ES')/api_compra2";

    // 📌 Asegúrate de enviar solo los datos esperados, sin `@odata.context`
    let cleanData = {
        "VendorNo": "40000",
        "VendorName": data.value[0].VendorName || null,
        "VendorAddress": data.value[0].VendorAddress || null,
        "VendorPostalCode": data.value[0].VendorPostalCode || null,
        "VendorCity": data.value[0].VendorCity || null,
        "VendorCIF": data.value[0].VendorCIF || null,
        "InvoiceDate": data.value[0].InvoiceDate || null,
        "DueDate": data.value[0].DueDate || null,
        "BaseAmount": data.value[0].BaseAmount || 0,
        "VATAmount": data.value[0].VATAmount || 0,
        "TotalAmount": data.value[0].TotalAmount || 0,
        "InvoiceNo": "250",
    };

    console.log("Datos enviados a Microsoft:", JSON.stringify(cleanData, null, 2));

    try {
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(cleanData)
        });

        if (!response.ok) {
            let errorText = await response.text(); // Obtener respuesta detallada del error
            throw new Error(`Error en la solicitud: ${response.status} - ${errorText}`);
        }

        let result = await response.json();
        console.log("Respuesta de Microsoft:", result);
        return result;
    } catch (error) {
        console.error("Error al enviar datos a Microsoft:", error);
    }
}



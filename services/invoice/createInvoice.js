const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function createInvoice(invoice, path) {
    const doc = new PDFDocument({
        margins: {
            top: 10,
            bottom: 10,
            left: 0,
            right: 10
        },
        size: "A4"
    });
    doc.rect(0, 0, 33, doc.page.height).fill("#008037")
    generateHeader(doc, invoice);
    generateCompanyDetails(doc, invoice);
    generateTable(doc, invoice);
    generateSummary(doc, invoice);
    generateFooter(doc, invoice);

    doc.end();
    doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc, invoice) {
    doc.font("fonts/Poppins-Bold.ttf");
    doc.image("logo.png", 60, 20, { width: 104 })
        .fillColor("#FF1616")
        .fontSize(24)
        .text("EXCELLENT TECHNOLOGY SYSTEM", 180, 15, { characterSpacing: 4 })

    doc.font(path.resolve(__dirname, "../..", "fonts", "Sanchez-Regular.ttf"));
    doc.fillColor("#008037")
        .fontSize(25)
        .text("INVOICE", 60, 105, { characterSpacing: 4 })

    doc.fontSize(11);
    const date = invoice.issueDate ? new Date(invoice.issueDate) : new Date();
    const invoiceDate = date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear();
    doc.text("DATE:", 340, 105, { characterSpacing: 2 })
        .font("fonts/Montserrat-Regular.ttf")
        .fillColor("#000000")
        .text(invoiceDate, 490, 105, { characterSpacing: 1 })
        .fillColor("#008037")

    doc.font(path.resolve(__dirname, "../..", "fonts", "Sanchez-Regular.ttf"));
    doc.text("INVOICE NO.", 340, 120, { characterSpacing: 2 })
        .font(path.resolve(__dirname, "../..", "fonts", "Montserrat-Regular.ttf"))
        .fillColor("#000000")
        .text(invoice.invoiceNumber, 490, 120)
        .moveDown();
}

let y = 175;
function generateCompanyDetails(doc, invoice) {
    /*
    const data = {
        seller: {
            name: "Excellent Technology System",
            address: "Shamim Tower, Nehru Nagar, Kurla East, Mumbai - 400 024",
            email: "excellentts123@gmail.com",
            contactNumber: "9029303750",
            businessNumber: "27AKEPB4917F1ZH"
        },
        buyer: {
            name: "Forbid Fire",
            address: "1, Vaity House, Navghar Pada, Mulund, Mumbai City, Maharashtra, 400087",
            email: "excellentts123@gmail.com",
            contactNumber: "9029303750",
            businessNumber: "27AKEPB4917F1ZH"
        }
    }
    */
    const data = invoice.participants;

    const seller = data.seller;
    const buyer = data.buyer;

    // seller
    doc
        .font("fonts/Montserrat-Bold.ttf")
        .fillColor("#000000")
        .text(seller.name, 60, 155)
        .font("fonts/Montserrat-Regular.ttf")

    y = 175;
    for (let prop in seller) {
        if (prop === "name") continue;
        doc
            .text(prop === "gstNumber" ? "GST : " + seller[prop] : seller[prop], 60, y, { width: 230 })

        y += doc.heightOfString(seller[prop], { width: 230 }) + 5;
    }

    let yAfterSeller = y;
    // buyer
    doc
        .font("fonts/Montserrat-Bold.ttf")
        .fillColor("#000000")
        .text(buyer.name, 340, 155)
        .font("fonts/Montserrat-Regular.ttf")
        .text(" (BUYER)", 340 + doc.widthOfString(buyer.name) + 5, 155);

    y = 175;
    for (let prop in buyer) {
        if (prop === "name") continue;
        doc
            .text(buyer[prop], 340, y, { width: 230 })

        y += doc.heightOfString(buyer[prop], { width: 230 }) + 5;
    }

    y = yAfterSeller;
}

function generateTable(doc, { items }) {
    /*
    const data = [
        {
            item: "20 zone Conventional",
            quantity: "01",
            price: "23,500",
            total: "23,500",
        },
        {
            item: "20 zone Conventional Fire Alarm Panel System with P.A. - 30 WATTS Amplifer including mic",
            quantity: "01",
            price: "23,500",
            total: "23,500",
        },
        {
            item: "20 zone Conventional",
            quantity: "01",
            price: "23,500",
            total: "23,500",
        },
        {
            item: "30 WATTS Amplifer including mic",
            quantity: "01",
            price: "23,500",
            total: "23,500",
        },
        {
            item: "30 WATTS Amplifer including mic",
            quantity: "01",
            price: "23,500",
            total: "23,500",
        }
    ];
    */
    const data = items;

    y += 15;
    doc
        .rect(60, y, 515, 30)
        .fill("#008037")

    doc
        .font("fonts/Sanchez-Regular.ttf")
        .fillColor("#ffffff")
        .fontSize(13)

    doc
        .text("ITEM", 65, y + 15, { baseline: "middle" })
        .text("QTY", 350, y + 15, { baseline: "middle" })
        .text("PRICE", 420, y + 15, { baseline: "middle" })
        .text("TOTAL", 500, y + 15, { baseline: "middle" })

    y += 30;
    doc.moveDown();

    data.forEach((obj, i) => {
        generateRow(doc, obj, i % 2 !== 0);
    });
}

function generateRow(doc, obj, odd) {
    const paddingTopBottom = 15;
    const posX = 60;
    const itemWidth = 260;
    const qtyWidth = doc.widthOfString("QTY", { baseline: "middle" });
    const priceWidth = doc.widthOfString("PRICE", { baseline: "middle" });
    const total = 50;

    const height = doc.heightOfString(obj.itemName, { width: itemWidth, characterSpacing: 0.5 });
    const heightOfRect = height + paddingTopBottom;
    doc.rect(posX, y, 515, heightOfRect);
    if (odd) doc.fill("#d3d3d3")
    if (!odd) doc.fill("#ffffff");
    doc
        .font("fonts/Montserrat-Regular.ttf")
        .fontSize(11)
        .fillColor("#000000")
        .text(obj.itemName, 65, y + (paddingTopBottom / 2), {
            width: itemWidth,
            characterSpacing: 0.5
        })
        .text(obj.quantity, 350, y + (height / 2), {
            width: qtyWidth,
            align: "center"
        })
        .text("₹" + parseFloat(obj.price).toLocaleString("en-in"), 420, y + (height / 2), {
            width: priceWidth + 10,
            align: "center"
        })
        .text("₹" + parseFloat(obj.total).toLocaleString("en-in"), 500, y + (height / 2), {
            width: priceWidth + 10,
            align: "center"
        })
    y += heightOfRect;
}

function generateSummary(doc, invoice) {
    const data = [
        ["Subtotal", invoice.summary.subTotal],
        ["CGST (9%)", invoice.summary.cgst],
        ["SGST (9%)", invoice.summary.sgst],
        ["Total GST (18%)", invoice.summary.gst],
        ["GRAND TOTAL", invoice.summary.grandTotal],
    ];
    y = 635;
    doc
        .font("./fonts/Montserrat-Regular.ttf")
        .fontSize(11)

    data.forEach(function (arr) {
        doc
            .text(arr[0], 360, y, { width: "100", align: "right" })
            .text("₹" + arr[1], 480, y, { width: "100", align: "left" })

        y += 21;
    });
}

function generateFooter(doc) {

    doc
        .strokeColor("#000000")
        .lineWidth(2)
        .moveTo(60, 740)
        .lineTo(550, 740)
        .stroke();

    doc
        .font("./fonts/Sanchez-Regular.ttf")
        .fontSize(12)
        .text("BANK DETAILS", 60, 748, { characterSpacing: 4 })
        .fontSize(11)
        .fill("#000000")
        .font("./fonts/Montserrat-Medium.ttf")
        .text("BANK NAME: ", 60, 768)
        .font("./fonts/Montserrat-Regular.ttf")
        .text("Hindustan Co-op Bank Ltd", 140, 768, { characterSpacing: 1 })
        .font("./fonts/Montserrat-Medium.ttf")
        .text("A/C NO: ", 60, 784)
        .font("./fonts/Montserrat-Regular.ttf")
        .text("008110100000718", 140, 784, { characterSpacing: 1 })
        .font("./fonts/Montserrat-Medium.ttf")
        .text("BRANCH: ", 60, 800)
        .font("./fonts/Montserrat-Regular.ttf")
        .text("Nehru Nagar, Kurla East", 140, 800, { characterSpacing: 1 })
        .font("./fonts/Montserrat-Medium.ttf")
        .text("IFS CODE: ", 60, 816)
        .font("./fonts/Montserrat-Regular.ttf")
        .text("SVCB0001008", 140, 816, { characterSpacing: 1 })

    doc
        .font("./fonts/Montserrat-Light.ttf")
        .fontSize(11)
        .text("FOR EXCELLENT TECHNOLOGY SYSTEM", 340, 748)
        .text("SIGNATURE", 400, 816);
}

module.exports = { createInvoice };
import bodyParser from "body-parser";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "public","html", "index.html"));
});

app.post("/submit", (req, res) =>{
    const inputData = req.body.notes;
    const eachDay = inputData.replace(/\r/g,"").split("\n");
    let arrayOfObjects = timeExtractor(eachDay);
    arrayOfObjects.forEach(object => {
        console.log(object.original + object.pay);
    });

    res.render("partials/calculated.ejs", {result: arrayOfObjects});
});

app.listen(port, () => {
    console.log(`The app is up and running in port ${port}`);
})


//a helper function which extracts the start and end time of working hours from the array items\
function timeExtractor(array){
    return array.map(item => {
        const [firstHalf, endTime] = item.split("to").map(time => time.trim());
        const startTime = firstHalf.split(" ").slice(-2).join(" ");
        const pay = payCalculator(startTime, endTime);
        return {original: item, pay}
    });
}

//creating a function to convert the time to 24 hour format

function timeConverter(timeStr){
    const [time, type] = timeStr.split(" ");
    var [hours, mins] = time.split(":").map(Number);

    if (type === "pm" && hours != 12){
        hours += 12;
    }

    if(type === "am" && hours === 12){
        hours = 0;
    }
    return [hours, mins];
}

function timeDiffCalculator(startTime, endTime){    //function to calculate timeDifference between working periods
    const [startHour, startMin] = timeConverter(startTime);
    const [endHour, endMin] = timeConverter(endTime);
    let hourDiff = endHour - startHour;
    let minDiff = endMin - startMin;
    
    if (minDiff < 0){
        minDiff = minDiff + 60;
        hourDiff -= 1;
    }

    return [hourDiff, minDiff];
}

function payCalculator(startTime, endTime){
    const [hourDiff, minDiff] = timeDiffCalculator(startTime, endTime);
    let totalPay = hourDiff * 30 + minDiff * 0.5;
    totalPay = totalPay.toFixed(2);
    console.log(totalPay);
    return totalPay;
}



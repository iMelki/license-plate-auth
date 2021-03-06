
const axios = require('axios');
//const debug = require('debug')('LPAuthCtrl');
const FormData = require('form-data');
// const async = require('async');

const dbService = require('../services/db-service');

exports.index = function(req, res) {   
    res.send('LPAuth');
};

//This function gets a URL of a license plate picture
//and returns an object with the resulting vehicle number or error in parsedText
const imgToText = async (url, ocrEngine) => {
    var answer = {
        GotError: false,
        parsedText: ""
    };
    // COPY FROM WEBSITE:
    var data = new FormData();
    data.append('language', 'eng');
    data.append('isOverlayRequired', 'false');
    data.append('url', url);
    data.append('iscreatesearchablepdf', 'false');
    data.append('issearchablepdfhidetextlayer', 'false');
    data.append('OCREngine', ocrEngine);

    const config = {
        method: 'post',
        url: 'https://api.ocr.space/parse/image',
        headers: { 
            'apikey': '61d195488d88957', 
            ...data.getHeaders()
        },
        data : data
    };

    await axios(config)
    .then(function (response) {
        if (response.data.IsErroredOnProcessing){
            answer.GotError = true;
            answer.parsedText = response.data.ErrorMessage;
        }else{ 
            answer.parsedText = JSON.stringify(response.data.ParsedResults[0].ParsedText);
        }
    })
    .catch(function (error) {
        answer.GotError = true;
        answer.parsedText = error;
    });
    
    return answer;
}

const licensePlateTextToVehicleNumber = (licensePlate) => {
    const endOfVehicleNumber = licensePlate.indexOf('\\');
    licensePlate = licensePlate.slice(0,endOfVehicleNumber);
    var ans = "";
    for (let i = 0; i < licensePlate.length; i++) {
        const char = licensePlate.charAt(i);
        if (char>=0 && char<=9 || char>='A' && char<='Z')
            ans = ans.concat(char);
    }
    if (ans.length>9) 
        ans = ans.slice(0,8);
    return ans;
}

const lastTwoDigits = (vehicleNumber) => {
    const len = vehicleNumber.length;
    return vehicleNumber.substr(len-2, 2);
}

const isPublicTransportVehicle = (vehicleNumber) => {
    const lastTwoDig = lastTwoDigits(vehicleNumber);
    return (lastTwoDig.charAt(0)==2 && (lastTwoDig.charAt(1)==5 || lastTwoDig.charAt(1)==6));
}

const isLawEnforcementVehicle = (vehicleNumber) => {
    for (let i = 0; i < vehicleNumber.length; i++) 
        if (vehicleNumber.charAt(i)>='A' && vehicleNumber.charAt(i)<='Z') 
            return true;
}

const sevenLongCaseC = (vehicleNumber) => {
    if (vehicleNumber.length != 7) 
        return {ans: false};
    for (let i = 0; i < vehicleNumber.length; i++) {
        if (vehicleNumber.charCodeAt(i)<48 || vehicleNumber.charCodeAt(i)>57) 
            return {ans: false};
    }
    const lastTwoDig = lastTwoDigits(vehicleNumber);
    if(lastTwoDig.charAt(0)==8 && lastTwoDig.charAt(1)>=5 && lastTwoDig.charAt(1)<=9 ||
        lastTwoDig.charAt(0)==0 && lastTwoDig.charAt(1)==0)
            return {ans: true,
                    lastTwoDigits: lastTwoDig};
    return {ans: false};
}

const isOperatedByGas = (vehicleNumber) => {
    if (vehicleNumber.length != 7 && vehicleNumber.length != 8) 
        return false;

    let sum = 0;    
    for (let i = 0; i < vehicleNumber.length; i++) {
        if (vehicleNumber.charCodeAt(i)<48 || vehicleNumber.charCodeAt(i)>57) 
            return false;
        sum+=(vehicleNumber.charCodeAt(i)-48);
    }
    if(sum % 7 == 0) return true;
}

const isAuthorizedVehicle = (vehicleNumber) => {
    if (isPublicTransportVehicle(vehicleNumber)) 
        return {decision: "Prohibited", reason: "Public Transportation Vehicle"};
    if (isLawEnforcementVehicle(vehicleNumber)) 
        return {decision: "Prohibited", reason: "Law Enforcement Vehicle"};
    const caseC = sevenLongCaseC(vehicleNumber);
    if (caseC.ans) 
        return {decision: "Prohibited", reason: "7 digit number and last two digits are ".concat(caseC.lastTwoDigits)};
    if (isOperatedByGas(vehicleNumber)) 
        return {decision: "Prohibited", reason: "Vehicle Suspected as Operated by Gas"};
    return {decision: "Allowed", reason: "Passed all checks"};
}

exports.check_license_plate = async function(req, res) {   
    var responseString = "";
    const {url} = req.body;
        
    //Get License Plate string out of picture:
    let licensePlateTextObject = await imgToText(url, '2');
    if (licensePlateTextObject.GotError){
        responseString = licensePlateTextObject.parsedText;
    }else{
        let vehicleNumber = licensePlateTextToVehicleNumber(licensePlateTextObject.parsedText);
        if(vehicleNumber.length<3){
            //try the 1st OCR Engine:
            licensePlateTextObject = await imgToText(url, '1');
            vehicleNumber = licensePlateTextToVehicleNumber(licensePlateTextObject.parsedText);
        }
        if (vehicleNumber.length<3){
            responseString = "Invalid license plate # or picture not recognised - plate #: "+vehicleNumber;
        }else{
            //Check and Decide by a,b,c,d:
            const decision = isAuthorizedVehicle(vehicleNumber);

            responseString = vehicleNumber + " is "+ decision.decision + " (" + decision.reason + ")";
            
            //Write the decision into the DB, with timestamp & reason (if prohibited)
            await dbService.addToDB({
                time: new Date(),
                license_plate: vehicleNumber,
                decision: decision.decision,
                reason: decision.reason
            });
        }
    }
    res.send(responseString);
};


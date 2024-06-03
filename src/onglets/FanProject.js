// ******************************************************************************
// * @file    HeartRate.js
// * @author  MCD Application Team
// *
//  ******************************************************************************
//  * @attention
//  *
//  * Copyright (c) 2022-2023 STMicroelectronics.
//  * All rights reserved.
//  *
//  * This software is licensed under terms that can be found in the LICENSE file
//  * in the root directory of this software component.
//  * If no LICENSE file comes with this software, it is provided AS-IS.
//  *
//  ******************************************************************************
import React, { useState } from 'react';
import fanicon from '../images/fan-icon.jpg';
import imagelightOffPink from '../images/lightOffPink.svg';
import imagelightOnPink from '../images/lightOnPink.svg';
import iconInfo from '../images/iconInfo.svg';
import iconLearn from '../images/iconLearn.svg';
import iconVentilateur from '../images/iconVentilateur.svg';
import errorIcon from '../images/error.jpg';
import { createLogElement } from "../components/Header";
import { OverlayTrigger, Popover } from 'react-bootstrap';

const FanProject = (props) => {
    let AnomalieCharacteristic;
    let SpeedCharacteristic;
    let TrainCharacteristic;
    let StatusCharacteristic;

    props.allCharacteristics.map(element => {
        switch (element.characteristic.uuid) {
            case "00000001-8e22-4541-9d4c-21edae82ed19":
            AnomalieCharacteristic = element;
            //notifyCharacteristic.characteristic.stopNotifications();
            break;
            case "00000002-8e22-4541-9d4c-21edae82ed19":
            SpeedCharacteristic = element;
            break;
            case "00000003-8e22-4541-9d4c-21edae82ed19":
            TrainCharacteristic = element;
            break;
            case "00000004-8e22-4541-9d4c-21edae82ed19":
            StatusCharacteristic = element;
            break;
            default:
            console.log("# No characteristics found..");
        }
    });


    document.getElementById("readmeInfo").style.display = "none";

    //Speed 
    const [speed, setSpeed] = useState(0);

    //Anomaly 
    const [showError, setShowError] = useState(false);

    //Learning showLearn
    const [showLearn, setshowLearn] = useState(false);

    const handleSpeedChange = (event) => {
        setSpeed(event.target.value);
    };

    //Speed write button
    const onSpeedButtonClick = async () => {
        const myWord = new Uint8Array([speed]);
        try {
            await SpeedCharacteristic.characteristic.writeValue(myWord);
            createLogElement(myWord, 1, "FanControl Speed");
        } catch (error) {
            console.log('Argh! ' + error);
        }
        //document.getElementById('imageLightBlue').src = imagelightOffPink;
        

        // Update fan rotation style
        const fanRotationStyle = {
            width: '20%',
            height: '20%'
        };

        if (speed > 0) {
            fanRotationStyle.animationName = 'fan-rotate';
            fanRotationStyle.animationDuration = `${(11 - speed)/2}s`;
            fanRotationStyle.animationTimingFunction = 'linear';
            fanRotationStyle.animationIterationCount = 'infinite';
            document.getElementById('fanBlades').classList.add('CoolingFan');
        } else {
            fanRotationStyle.animationName = 'fan-rotate';
            fanRotationStyle.animationDuration = `${0}s`;
            fanRotationStyle.animationTimingFunction = 'linear';
            fanRotationStyle.animationIterationCount = 'infinite';
            document.getElementById('fanBlades').classList.add('CoolingFan');
        }
        
          // Set fan rotation style
          Object.assign(document.getElementById('fanBlades').style, fanRotationStyle);
    }

    //Notify ON/OFF Button
    async function onNotifyButtonClick() {
        let notifStatus = document.getElementById('notifyButton').innerHTML;

        if (notifStatus === "Notify OFF") {
          console.log('Notification ON');
          //Start Anomaly and status Notif
          AnomalieCharacteristic.characteristic.startNotifications();
          AnomalieCharacteristic.characteristic.oncharacteristicvaluechanged = notifHandler;
          StatusCharacteristic.characteristic.startNotifications();
          StatusCharacteristic.characteristic.oncharacteristicvaluechanged = notifStatusHandler;
          document.getElementById('notifyButton').innerHTML = "Notify ON"
          createLogElement(AnomalieCharacteristic, 3, "FanControl ENABLE NOTIFICATION ");
        } else {
          //Stop Notif
          AnomalieCharacteristic.characteristic.stopNotifications();
          console.log('Notification OFF');
          document.getElementById('notifyButton').innerHTML = "Notify OFF"
          createLogElement(AnomalieCharacteristic, 3, "FanControl DISABLE NOTIFICATION ");
        }
        //document.getElementById('imageLightBlue').src = imagelightOffPink;
    }

    //Train Button
    async function onTrainButtonClick() {
        //let trainStatus = document.getElementById('writeInput').innerHTML;
        let myWord = new Uint8Array(1);
        myWord[0] = 0x1;

        try {
            await TrainCharacteristic.characteristic.writeValue(myWord);
            createLogElement(myWord, 1, "FanCotrol Speed");
        }
        catch (error) {
            console.log('2 : Argh! ' + error);
        }
        document.getElementById('imageLightBlue').src = imagelightOffPink;
    }

    // Anomaly handler
    function notifHandler(event) {
        console.log("Notification received");
        var buf = new Uint8Array(event.target.value.buffer);
        console.log(buf);
        createLogElement(buf, 1, "FanControl NOTIFICATION RECEIVED");
        if (buf[0] == 1) {
            console.log('Anomaly detected');
            setShowError(true);
        //}
        } else {
            setShowError(false);
        }
    }

    //Status handler
    function notifStatusHandler(event){
        console.log("Notification received");
        var buf = new Uint8Array(event.target.value.buffer);
        console.log(buf);
        createLogElement(buf, 1, "FanControl Status NOTIFICATION RECEIVED");
        if (buf[0] == 1) {
            setshowLearn(true);
        } else {
            setshowLearn(false);
        }
    }

    // Tooltips

    const popoverNotifyButton = (
        <Popover id="popover-trigger-hover-focus" title="Popover bottom">
          <strong>Info :</strong> Enable the reception of notifications from the connected device. <br />
          Example : <br />
          Enable the notifications then push SW1. 
        </Popover>
    );

    const popoverTrainButton = (
        <Popover id="popover-trigger-hover-focus" title="Popover bottom">
          <strong>Info :</strong> Train AI model <br />
        </Popover>
    );



    return (
        <div className="container-fluid">
          <div className="container">
            <div className="row justify-content-center mt-3">
              <div className="d-grid col-xs-6 col-sm-6 col-md-4 col-lg-4 m-2">
                <div className="d-flex flex-row">
                  <button className="defaultButton w-100" type="button" onClick={onNotifyButtonClick} id="notifyButton">Notify OFF</button>
                  <span>
                    <OverlayTrigger
                      trigger={["hover", "focus"]}
                      placement="bottom"
                      overlay={popoverNotifyButton}
                    >
                      <img className="iconInfo" src={iconInfo} alt="Info icon" />
                    </OverlayTrigger>
                  </span>
                </div>
              </div>
            </div>
      
            <div className="row justify-content-center mt-3">
              <div className="col-xs-6 col-sm-6 col-md-4 col-lg-4 m-2">
                <div className="input-group">
                  <span className="d-flex flex-row">Speed</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="form-range"
                  />
                  <div className="d-flex flex-row">
                    <button className="defaultButton" type="button" onClick={onSpeedButtonClick}>Write</button>
                  </div>
                </div>
              </div>
            </div>
      
            <div className="row justify-content-center mt-3">
              <div className="d-grid col-xs-6 col-sm-6 col-md-4 col-lg-4 m-2">
                <div className="d-flex flex-row">
                  <button className="defaultButton w-100" type="button" onClick={onTrainButtonClick} id="notifyButton">Train AI Fan</button>
                  <span>
                    <OverlayTrigger
                      trigger={["hover", "focus"]}
                      placement="bottom"
                      overlay={popoverTrainButton}
                    >
                      <img className="iconInfo" src={iconInfo} alt="Info icon" />
                    </OverlayTrigger>
                  </span>
                </div>
              </div>
            </div>
      
            <div className="fan-container" style={{ position: "relative", marginTop: "50px" }}>
              <img src={fanicon} id="fanBlades" alt="Fan Blades" className="CoolingFan" style={{ position: "static" }} />
              {showError && (
                <div className="error-message" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "red", color: "white", padding: "15px" }}>
                  Anomaly detect
                </div>
              )}
              {showLearn && (
                <div className="error-message" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "blue", color: "white", padding: "15px" }}>
                  Learning
                </div>
              )}
            </div>
          </div>
        </div>
      );


};

export default FanProject;
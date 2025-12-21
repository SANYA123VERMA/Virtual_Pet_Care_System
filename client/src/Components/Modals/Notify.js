import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { Tabs, Tab } from "react-bootstrap";

const Notify = (props) => {
  const notifyItems = props?.vals || [[], [], []];
  const med = notifyItems[0] || [];
  const vet = notifyItems[1] || [];
  const rem = notifyItems[2] || [];
  const [defActKey, setDefActKey] = useState("meds");

  // Logic to set active tab if default is empty
  useEffect(() => {
    if (med.length > 0) setDefActKey("meds");
    else if (vet.length > 0) setDefActKey("vets");
    else if (rem.length > 0) setDefActKey("rems");
  }, [med.length, vet.length, rem.length]);

  return (
    <Tabs defaultActiveKey={defActKey} activeKey={defActKey} onSelect={(k) => setDefActKey(k)} id="uncontrolled-tab-example">
      {med.length > 0 && (
        <Tab eventKey="meds" title="Medications">
          <ul>
            {med.map((appt, index) => (
              <li key={index} className="notifications-list">
                {appt.Pet} &nbsp;
                <Moment utc format="MM/DD/YYYY">
                  {appt.Date}
                </Moment>
                &nbsp; {appt.Medication}&nbsp;
                {appt.Dose}
              </li>
            ))}
          </ul>
        </Tab>
      )}
      {vet.length > 0 && (
        <Tab eventKey="vets" title="Vet Visits">
          <ul>
            {vet.map((appt, index) => (
              <li key={index} className="notifications-list">
                {appt.Pet} &nbsp;
                <Moment utc format="MM/DD/YYYY">
                  {appt.Date}
                </Moment>
                &nbsp;{appt.Notes}
              </li>
            ))}
          </ul>
        </Tab>
      )}
      {rem.length > 0 && (
        <Tab eventKey="rems" title="Reminders">
          <ul>
            {rem.map((appt, index) => (
              <li key={index} className="notifications-list">
                {appt.Pet} &nbsp;
                <Moment utc format="MM/DD/YYYY">
                  {appt.Date}
                </Moment>
                &nbsp; {appt.Title}&nbsp;
                {appt.Notes}
              </li>
            ))}
          </ul>
        </Tab>
      )}
    </Tabs>
  );
};

export default Notify;

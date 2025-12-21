import React from "react";
import { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import AddReminder from "./Modals/AddReminder";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { getPetData } from "../Components/Helpers/PetFunctions";
import PetContext from "../Context/PetContext";
import UserContext from "../Context/UserContext";


const publicVapidKey = "BK9M-mGggQw8bsFVWSAflQRwdefprehKMHHim5nKrxqXhyNNfDxzUFEI9Cxh0U2HdtnJD_yAkenopAJOQmV2v-A";

function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

const Reminders = (props) => {
	let newData = props;
	const { petId } = useContext(PetContext);
	const { userData } = useContext(UserContext); // Get User Context
	const [reminders, setReminders] = useState(newData.Reminders);
	const [existing, setExisting] = useState(false);
	const [show, setShow] = useState(false);
	const [modalData, setModalData] = useState(null);

	const [alarmActive, setAlarmActive] = useState(false);
	const [activeReminder, setActiveReminder] = useState(null);
	const [dismissedAlarms, setDismissedAlarms] = useState(new Set());

	const subscribeUser = async () => {
		if ('serviceWorker' in navigator) {
			try {
				const register = await navigator.serviceWorker.ready;
				const subscription = await register.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
				});

				// Send Subscription to Backend
				await axios.post('/api/subscribe', {
					endpoint: subscription.endpoint,
					keys: subscription.toJSON().keys,
					userId: userData.user.id || userData.user._id // Use actual User ID
				}, {
					headers: { "x-auth-token": localStorage.getItem("auth-token") },
				});

				toast.success("Notifications Enabled!");
			} catch (err) {
				console.error("Push Error", err);
				toast.error("Failed to enable notifications");
			}
		}
	};

	const handleClose = React.useCallback(() => {
		setShow(false);
		getPetData(petId).then((data) => setReminders(data.Reminders));
	}, [petId]);

	const stopAlarm = () => {
		setAlarmActive(false);
		if (activeReminder) {
			const now = new Date();
			const instanceId = `${activeReminder._id}-${now.getDay()}-${now.getHours()}-${now.getMinutes()}`;
			setDismissedAlarms(prev => new Set(prev).add(instanceId));
		}
		setActiveReminder(null);
		window.speechSynthesis.cancel();
	};

	useEffect(() => {
		if (props.Reminders) {
			let r = [...props.Reminders];
			r.sort(function (a, b) {
				var nameA = a.Date,
					nameB = b.Date;
				if (nameA < nameB) return 1;
				if (nameA > nameB) return -1;
				return 0;
			});
			setReminders(r);
		}
	}, [props.Reminders]);

	useEffect(() => {
		let alarmInterval;
		if (alarmActive && activeReminder) {
			const speak = () => {
				if ('speechSynthesis' in window) {
					const msg = new SpeechSynthesisUtterance(`Reminder: ${activeReminder.Title}`);
					window.speechSynthesis.speak(msg);
				}
			};
			speak();
			alarmInterval = setInterval(speak, 5000); // Repeat every 5 seconds
		}
		return () => clearInterval(alarmInterval);
	}, [alarmActive, activeReminder]);

	useEffect(() => {
		const checkReminders = () => {
			if (alarmActive) return; // Don't trigger new alarms if one is ringing

			const now = new Date();
			const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			const currentDay = daysMap[now.getDay()];

			reminders.forEach((rem) => {
				const remDate = new Date(rem.Date);
				let isDue = false;

				// Create a unique ID for this specific minute to check if dismissed
				const instanceId = `${rem._id}-${now.getDay()}-${now.getHours()}-${now.getMinutes()}`;
				if (dismissedAlarms.has(instanceId)) return;

				if (rem.Frequency === "Daily") {
					if (now.getHours() === remDate.getHours() && now.getMinutes() === remDate.getMinutes()) {
						isDue = true;
					}
				} else if (rem.Frequency === "Weekly") {
					// Check if today is in SelectedDays AND time matches
					const isTodaySelected = rem.SelectedDays && rem.SelectedDays.includes(currentDay);
					if (isTodaySelected && now.getHours() === remDate.getHours() && now.getMinutes() === remDate.getMinutes()) {
						isDue = true;
					}
				} else {
					// Once
					const diff = now - remDate;
					if (diff >= 0 && diff < 60000) {
						isDue = true;
					}
				}

				if (isDue) {
					setActiveReminder(rem);
					setAlarmActive(true);
				}
			});
		};

		const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
		return () => clearInterval(interval);
	}, [reminders, alarmActive, dismissedAlarms]);

	const handleAddUpdateReminder = async (e, form, cb) => {
		e.preventDefault();

		let url;
		let reminderId = form.addReminderForm.reminderId.value;
		const vals = {
			Date: form.addReminderForm.Date.value,
			Title: form.addReminderForm.Title.value,
			Note: form.addReminderForm.Note.value,
			Frequency: form.addReminderForm.Frequency.value,
			SelectedDays: JSON.parse(form.addReminderForm.SelectedDays.value || "[]"),
		};

		if (existing) {
			url = `/api/updatePetReminder/${petId}/${reminderId}`;
		} else {
			url = `/api/addPetReminder/${petId}`;
		}

		return cb(url, vals);
	};

	const handleDelReminder = async (e, form, cb) => {
		e.preventDefault();
		let reminderId = form.addReminderForm.reminderId.value;
		let vals = {};
		let url = `/api/delPetReminder/${petId}/${reminderId}`;
		return cb(url, vals);
	};

	const postReminder = async (url, vals) => {
		try {
			await axios.put(url, vals, {
				headers: { "x-auth-token": localStorage.getItem("auth-token") },
			});
			handleClose();
		} catch (err) {
			console.log(err);
			toast.error(err.response);
		}
	};

	useEffect(() => { }, [handleClose]);

	const update = async (e, data) => {
		e.preventDefault();
		setModalData(data);
		setExisting(true);
		setShow(true);
	};

	const add = async (e, data) => {
		e.preventDefault();
		setExisting(false);
		setShow(true);
		setModalData({ _id: 0, Date: new Date(), Title: "", Note: "", Frequency: "Once", SelectedDays: [] });
	};

	return (
		<div className="card m-2 shadow rounded" id="petDashCard">
			<div className="card-body text-center">
				<h3 className="card-title">Reminders
					<button onClick={subscribeUser} className="btn btn-sm btn-outline-primary ms-2" title="Enable Background Notifications">
						<i className="fa fa-bell"></i>
					</button>
				</h3>
				<div className="pet-table">
					<ul className="overflow-auto">
						{reminders.length > 0 ? reminders.map((rem) => (
							<li
								key={rem._id}
								onClick={(e) => update(e, rem)}
								className="pet-list btn w-100 container py-1 mb-2"
							>
								<div>
									<Moment format="MM/DD/YYYY h:mm a">{rem.Date}</Moment>
								</div>
								<div>{rem.Title} ({rem.Frequency || "Once"})</div>
								&nbsp;{rem.Note}
							</li>
						)) : <p className="empty-list-msg">No reminders set.</p>}
					</ul>
				</div>
				<button
					onClick={(e) => add(e, { _id: 0 })}
					className="edit-reminders-btn btn btn-circle shadow"
				>
					<i className="fa fa-plus my-float"></i>
				</button>
				<Modal show={show} onHide={handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Add or Edit Reminders</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<AddReminder petId={petId} data={modalData} existing={false} />
					</Modal.Body>
					<Modal.Footer>
						{existing ? (
							<Button
								className="delete-saved-entry"
								onClick={(e) =>
									handleDelReminder(e, document.forms, postReminder)
								}
							>
								Delete Reminder
							</Button>
						) : null}
						<Button
							className="save-updated-entry"
							onClick={(e) =>
								handleAddUpdateReminder(e, document.forms, postReminder)
							}
						>
							Submit Changes
						</Button>
					</Modal.Footer>
				</Modal>

				{/* Alarm Modal */}
				<Modal show={alarmActive} onHide={() => { }} backdrop="static" keyboard={false}>
					<Modal.Header>
						<Modal.Title style={{ color: 'red', fontWeight: 'bold' }}>
							<i className="fa fa-bell fa-shake"></i> ALARM!
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="text-center">
						<h3>{activeReminder?.Title}</h3>
						<p>{activeReminder?.Note}</p>
						<p className="text-muted">It's time!</p>
					</Modal.Body>
					<Modal.Footer className="justify-content-center">
						<Button variant="danger" size="lg" onClick={stopAlarm}>
							<i className="fa fa-stop-circle"></i> STOP ALARM
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		</div>
	);
};

export default Reminders;

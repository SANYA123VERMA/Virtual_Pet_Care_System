import React from "react";

const About = () => {
	return (
		<div className="col-md-5 about-card m-4">
			<div className="card text-center w-75 border-0">
				<h5 className="card-title">The Fluffy App</h5>
				<div className="card-body">
					<img
						src="../images/paw_logo.PNG"
						alt="petLogo"
						className="p-3 img-fluid rounded-circle w-10"
					></img>

					<p className="card-text">
						We built this platform to make pet care simple, organized, and stress-free. Our goal is to help pet parents manage daily routines, track health needs, and stay connected with a loving pet community. From reminders and vet visits to sharing special moments and chatting with fellow pet lovers, everything you need to care for your pet is in one place.
					</p>
				</div>
			</div>
		</div>
	);
};

export default About;

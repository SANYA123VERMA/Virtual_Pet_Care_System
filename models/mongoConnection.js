// const mongoose = require("mongoose");

// mongoose.connect(
// 	process.env.MONGODB_URI || "mongodb://localhost/myPet",
// 	{
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 		useCreateIndex: true,
// 		useFindAndModify: true,
// 	},
// 	(err) => {
// 		if (err) throw err;
// 		console.log("MongoDB connection established");
// 	}
// );

// module.exports = mongoose;



const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myPet",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex and useFindAndModify are deprecated, remove them
  }
)
.then(() => console.log("MongoDB connection established"))
.catch((err) => console.error("MongoDB connection error:", err));

module.exports = mongoose;


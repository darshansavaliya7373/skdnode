var admin = require("../model/user.model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const coilModel = require("../model/coil.model");
const userModel = require("../model/user.model");

function empty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] === null || obj[key] === "") {
                return true;
            }
        }
    }
    return false;
}

// login user
exports.login = async (req, res) => {
    var { number } = req.body;
    var data = await userModel.findOne({ number });
    console.log(data, req.body);
    if (data == null) {
        return res.status(400).json({ message: "detail not found" });
    } else {
        if (req.body.password == data.password) {
            var token = jwt.sign({ id: data.id }, "developer");
            if (token) {
                res.cookie("token", token);
                return res
                    .status(200)
                    .json({ message: "token generated successfully", token });
            }
        }
    }
};
// add coil with operator
exports.addcoil = async (req, res) => {
    try {
        console.log(req.body);
        const { no, mm, meter, weight, remark } = req.body;
        if (empty(req.body)) {
            return res.status(404).json({ message: "some field is empty" });
        } else {
            var data = await coilModel.create(req.body);
            if (data) {
                res.status(200).json({ message: "data added successfully", data });
            } else {
                res.status(404).json({ message: "data not created", data });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal error", error });
    }
};
// coil entry
exports.coilenter = async (req, res) => {
    try {
        console.log(req.body);
        if (req.body.palateno === "") {
            req.body.palateno = "null";
        }
        if (empty(req.body)) {

            return res.status(404).json({ message: "some field is empty" });

        } else {
            var data = await coilModel.findById(req.params.id);
            var coilno = data.data.slice(-1);
            if (coilno.length == 0) {
                req.body.coilno = 1;
            } else {
                req.body.coilno = parseInt(coilno[0].coilno) + 1;
            }
            req.body.date = new Date().toLocaleDateString()
            req.body.mainid = req.params.id
            data = await coilModel.findByIdAndUpdate(
                req.params.id,
                { $push: { data: req.body } },
                { new: true }
            );
            if (data) {
                res.status(200).json({ message: "data updated successfully", data });
            } else {
                res.status(404).json({ message: "data not created", data });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal error", error });
    }
};
// coil data to update
exports.singlecoilupdate = async (req, res) => {
    try {
        const coilIdToUpdate = req.params.id; // The _id of the element in the data array

        const data = await coilModel.findByIdAndUpdate(
            req.params.coil, // Use the main document _id here
            {
                $set: {
                    "data.$[element].coilno": req.body.coilno,
                    "data.$[element].mm": req.body.mm,
                    "data.$[element].meter": req.body.meter,
                    "data.$[element].weight": req.body.weight,
                    "data.$[element].remark": req.body.remark,
                },
            },
            {
                arrayFilters: [{ "element._id": coilIdToUpdate }],
                new: true,
            }
        );
        if (data) {
            res.status(200).json({ message: "Coil updated successfully", data });
        } else {
            console.log("Data not updated:", data);
            res.status(400).json({ message: "Coil not updated" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// coil data to enter for today
exports.todayaddcoil = async (req, res) => {
    var date = new Date().toLocaleDateString();
    var data = await coilModel.find({ date });
    console.log(data);
    if (data.length > 0) {
        res.status(200).json({ istodaycoil: true });
    } else {
        res.status(200).json({ istodaycoil: false });
    }
};
// all coil
exports.allcoil = async (req, res) => {
    try {
        const allCoilData = await coilModel.find({});
        const allDataArrays = allCoilData.map((coil) => coil.data);
        const flattenedDataArray = allDataArrays.flat();
        res.status(200).json(flattenedDataArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// update coil palateno
exports.updatepalate = async (req, res) => {
    try {
        const { datatoupdate, dataid } = req.body;
        console.log(req.body);
        var datacount = []
        for (const id of dataid) {
            var result = await coilModel.updateOne(
                { "data._id": id },
                { $set: { "data.$.palateno": datatoupdate } }
            )
            datacount.push('')
        }
        if (result) {
            res.status(200).json({ message: "Palateno updated successfully", dataupdated: datacount.length });
        } else {
            res.status(404).json({ message: "No documents updated" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// all coil whose palate no is empty
exports.emptypalateno = async (req, res) => {
    try {
        const allCoilData = await coilModel.find({});
        const allDataArrays = allCoilData.map((coil) => coil.data);
        const flattenedDataArray = allDataArrays.flat();
        const emptyPalatenoData = flattenedDataArray.filter(
            (coil) => coil.palateno === "null"
        );
        res.status(200).json(emptyPalatenoData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// delete single coil
exports.deleteSingleCoil = async (req, res) => {
    try {
        const coilIdToDelete = req.params.id;
        const data = await coilModel.findOneAndUpdate(
            { "data._id": coilIdToDelete },
            {
                $pull: {
                    data: { _id: coilIdToDelete },
                },
            },
            {
                new: true,
            }
        );
        if (data) {
            res.status(200).json({ message: "Coil deleted successfully", data });
        } else {
            console.log("Data not updated:", data);
            res.status(400).json({ message: "Coil not deleted" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.operatorwithcoil = async (req, res) => {

    var data = await coilModel.find()
    if (data) {
        return res.status(200).json(data)
    } else {
        return res.status(400).json({ message: "data not found", data })
    }

}
exports.filterCoilData = async (req, res) => {
    try {
        const { mm, meter, weight, lessthanmeter, greaterthanmeter } = req.body;

        const filterConditions = {};

        if (mm) {
            filterConditions['data.mm'] = mm;
        }

        if (meter) {
            filterConditions['data.meter'] = meter;
        }

        if (weight) {
            filterConditions['data.weight'] = weight;
        }

        if (lessthanmeter !== undefined) {
            filterConditions['data.meter'] = { $lte: lessthanmeter };
        }

        if (greaterthanmeter !== undefined) {
            filterConditions['data.meter'] = { $gte: greaterthanmeter };
        }

        const filteredCoilData = await coilModel.find(filterConditions);

        if (filteredCoilData.length > 0) {
            res.status(200).json({ message: "Filtered data retrieved successfully", data: filteredCoilData });
        } else {
            res.status(404).json({ message: "No matching documents found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

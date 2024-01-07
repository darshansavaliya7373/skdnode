var admin = require("../model/user.model");
var jwt = require("jsonwebtoken");
const coilModel = require("../model/coil.model");
const userModel = require("../model/user.model");
const chalanModel = require("../model/chalan.model");
const puppeteer = require('puppeteer');
const mmModel = require("../model/mm.model");
const ObjectId = require('mongoose').Types.ObjectId;

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
        console.log(req.body,"coil enter");
        if (empty(req.body)) {
            
            return res.status(404).json({ message: "some field is empty" });
            
        } else {
            if (req.body.palateno === "") {
                req.body.palateno = "null";
            }
            const allCoilData = await coilModel.find({});
            const allDataArrays = allCoilData.map((coil) => coil.data);
            const flattenedDataArray = allDataArrays.flat();
            // console.log(flattenedDataArray)
            if (flattenedDataArray.length == 0) {
                req.body.coilno = 1
            } else {
                req.body.coilno = parseInt(flattenedDataArray.slice(-1)[0].coilno) + 1
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
        console.log(req.body, req.params);
        if(req.body.palateno==""){
            req.body.palateno="null"
        }
        const data = await coilModel.findByIdAndUpdate(
            req.params.coil, // Use the main document _id here
            {
                $set: {
                    "data.$[element].coilno": req.body.coilno,
                    "data.$[element].mm": req.body.mm,
                    "data.$[element].meter": req.body.meter,
                    "data.$[element].weight": req.body.weight,
                    "data.$[element].remark": req.body.remark,
                    "data.$[element].palateno": req.body.palateno,
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
    console.log(date);
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
        console.log(allCoilData.length);
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
// full data of coil
exports.operatorwithcoil = async (req, res) => {

    var data = await coilModel.find()
    if (data) {
        return res.status(200).json(data)
    } else {
        return res.status(400).json({ message: "data not found", data })
    }

}
// chalan creating
exports.chalan = async (req, res) => {

    console.log(req.body);
    if (empty(req.body)) {
        return res.status(404).json({ message: "some field is empty" })
    }
    var data = await chalanModel.create({ coilsid: req.body.coilstomakechalan })
    if (data) {
        for (const id of req.body.coilstomakechalan) {
            var result = await coilModel.updateOne(
                { "data._id": id },
                { $set: { "data.$.chalan": true } }
            )
        }
        return res.status(200).json({ message: "success chalan created " })
    } else {
        return res.status(400).json({ message: "error while creating chalan " });
    }
}
// allchalans
exports.allchalans = async (req, res) => {
    try {
        const allCoilData = await coilModel.find({});
        const allDataArrays = allCoilData.map((coil) => coil.data);
        const flattenedDataArray = allDataArrays.flat();
        const allchalans = await chalanModel.find({});
        const chalansWithCoilData = allchalans.map((chalan) => {
            const updatedCoilsid = chalan.coilsid.map((coilsid) => {
                const matchingCoil = flattenedDataArray.find((coil) => coil._id.equals(coilsid));
                return matchingCoil || coilsid; // Use existing coilsid if not found
            });

            return {
                ...chalan.toObject(), // Convert Mongoose Document to plain object
                coilsid: updatedCoilsid,
            };
        });

        // console.log(chalansWithCoilData);

        res.status(200).json(chalansWithCoilData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};
// generate bill
exports.generateBill = async (req, res) => {
    try {
        const allCoilData = await coilModel.find({});
        const allDataArrays = allCoilData.map((coil) => coil.data);
        const flattenedDataArray = allDataArrays.flat();
        const allchalans = await chalanModel.find({});
        const chalansWithCoilData = allchalans.map((chalan) => {
            const updatedCoilsid = chalan.coilsid.map((coilsid) => {
                const matchingCoil = flattenedDataArray.find((coil) => coil._id.equals(coilsid));
                return matchingCoil || coilsid; // Use existing coilsid if not found
            });

            return {
                ...chalan.toObject(), // Convert Mongoose Document to a plain object
                coilsid: updatedCoilsid,
            };
        });

        const chalanId = req.params.id;
        const chalan = chalansWithCoilData.find((c) => c._id.equals(chalanId));

        if (!chalan) {
            return res.status(404).send('Chalan not found');
        }

        const today = new Date();

        const groupedCoils = groupCoils(chalan.coilsid);
        const totalMeter = calculateTotalMeter(flattenedDataArray);
        const totalCoils = flattenedDataArray.length;
        function simplifyCoilRange(coilRange) {
            const coils = coilRange.split(' to ').map(Number);
            
            if (coils.length < 2) {
                return coilRange; // Not a valid range
            }
        
            const sortedCoils = [...coils].sort((a, b) => a - b);
            const minCoil = sortedCoils[0];
            const maxCoil = sortedCoils[sortedCoils.length - 1];
        
            return minCoil === maxCoil ? minCoil.toString() : `${minCoil} to ${maxCoil}`;
        }
        
        // Example usage:
        const simplifiedRange = simplifyCoilRange('313 to 314 to 315 to 316');
        console.log(simplifiedRange); // Output: "4 to 16"
        
        const billHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill</title>
          <style>
            table {
              font-family: Arial, sans-serif;
              border-collapse: collapse;
              width: 100%;
            }
  
            th, td {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
            }
  
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>Bill - ${today.toISOString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Coil No</th>
                <th>Meter</th>
                <th>Total Coil</th>
              </tr>
            </thead>
            <tbody>
              ${groupedCoils.map((group) => `
                <tr>
                  <td>${simplifyCoilRange(group.coilRange)}</td>
                  <td>${calculateTotalMeter(group.coils)}</td> 
                  <td>${group.coils.length}</td>
                </tr>
              `).join('')}

              <tr>
              <td>Total</td>
              <td>${totalMeter}</td>
              <td>${totalCoils}</td>
            </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;
      res.send(billHtml);
    } catch (error) {
        console.error('Error generating bill:', error);
        res.status(500).json({message:'Internal Server Error'});
    }
    function groupCoils(coils) {
        const groupedCoils = [];
        let currentGroup = { coilRange: '', coils: [] };
    
        for (const coil of coils) {
            if (currentGroup.coils.length === 0) {
                currentGroup.coils.push(coil);
                currentGroup.coilRange = coil.coilno.toString();
            } else {
                const lastCoil = currentGroup.coils[currentGroup.coils.length - 1];
                if (coil.coilno - lastCoil.coilno === 1) {
                    currentGroup.coils.push(coil);
                    currentGroup.coilRange = `${currentGroup.coilRange} to ${coil.coilno}`;
                } else {
                    groupedCoils.push(currentGroup);
                    currentGroup = { coilRange: coil.coilno.toString(), coils: [coil] };
                }
            }
        }
    
        if (currentGroup.coils.length > 0) {
            groupedCoils.push(currentGroup);
        }
    
        return groupedCoils;
    }
    
    function calculateTotalMeter(coils) {
        return coils.reduce((total, coil) => total + parseFloat(coil.meter), 0);
    }
};

exports.allmm = async(req,res)=>{
    var data = await mmModel.find()
    res.status(200).json(data);
}
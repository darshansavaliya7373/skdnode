var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const coilModel = require("../model/coil.model");
const adminModel = require("../model/admin.model");
const chalanModel = require("../model/chalan.model");
const puppeteer = require("puppeteer");
const mmModel = require("../model/mm.model");
const userModel = require("../model/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

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
// login admin
exports.login = async (req, res) => {
  var { number } = req.body;
  var data = await adminModel.findOne({ number });
  console.log(data, req.body);
  if (data == null) {
    req.flash("success", "number not found");
    return res.redirect("/admin/login");
  } else {
    if (req.body.password == data.password) {
      var token = jwt.sign({ id: data.id }, process.env.JWT_KEY);
      if (token) {
        res.cookie("token", token);
        return res.redirect("/admin");
      }
    } else {
      req.flash("success", "invalid password");
      return res.redirect("back");
    }
  }
};
// home page
exports.home = async (req, res) => {
  var mm = await mmModel.find();
  var user = await userModel.find();
  const allCoilData = await coilModel.find({});
  const allDataArrays = allCoilData.map((coil) => coil.data);
  const flattenedDataArray = allDataArrays.flat();
  const allchalans = await chalanModel.find({});
  const chalansWithCoilData = allchalans.map((chalan) => {
    const updatedCoilsid = chalan.coilsid.map((coilsid) => {
      const matchingCoil = flattenedDataArray.find((coil) =>
        coil._id.equals(coilsid)
      );
      return matchingCoil || coilsid;
    });

    return {
      ...chalan.toObject(),
      coilsid: updatedCoilsid,
    };
  });
  res.render("home", { mm, chalansWithCoilData,user });
};
// login page 
exports.loginpage = async (req, res) => {
  res.render("login");
};

exports.deletemm = async (req, res) => {
  try {
    var data = await mmModel.findByIdAndDelete(req.params.id)
  if(data){
    req.flash("success","data deleted successfully")
    return res.redirect('back')
  }else{
    req.flash("success","data not deleted")
    return res.redirect('back')
  }
  } catch (error) {
   console.log(error);
   res.redirect('back') 
  }
}
exports.deleteuser = async (req, res) => {
  try {
    var data = await userModel.findByIdAndDelete(req.params.id)
  if(data){
    req.flash("success","data deleted successfully")
    return res.redirect('back')
  }else{
    req.flash("success","data not deleted")
    return res.redirect('back')
  }
  } catch (error) {
   console.log(error);
   res.redirect('back') 
  }
}

// add mm form
exports.addmm = async (req, res) => {
  console.log(req.body);
  if (req.body.mm == undefined || req.body.mm == "" || req.body.mm == null) {
    req.flash("success", "field is empty");
    return res.redirect("back");
  } else {
    var data = await mmModel.create(req.body);
    if (data) {
      req.flash("success", "data added successfully");
      return res.redirect("back");
    } else {
      req.flash("success", "data not added ");
      return res.redirect("back");
    }
  }
};

exports.adduser = async (req, res) => {
  console.log(req.body);
  if (req.body.name == undefined || req.body.name == "" || req.body.email == undefined || req.body.email == "" || req.body.number == undefined || req.body.number == "" || req.body.password == undefined || req.body.password == "" || req.body.authority == undefined || req.body.authority.length == 0) {
    req.flash("success", "field is empty");
    return res.redirect("back");
  } else {
    var data = await userModel.create(req.body);
    if (data) {
      req.flash("success", "data added successfully");
      return res.redirect("back");
    } else {
      req.flash("success", "data not added ");
      return res.redirect("back");
    }
  }
};


exports.generateBill = async (req, res) => {
  try {
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    const page = await browser.newPage();
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
        <h2>Bill - ${today.toLocaleDateString()}</h2>
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

    await page.setContent(billHtml);
    const pdfBuffer = await page.pdf();

    await browser.close();

    res.contentType('application/pdf');
    res.send(pdfBuffer);
    // res.status(200).send(billHtml);
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
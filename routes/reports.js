const router = require("express").Router();
const Report = require("../models/Report");

//CREATE

router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
    const newReport = await report.save();
    res.status(200).json(newReport);
  } catch (err) {
    console.log(err);
  }
});

//UPDATE

router.put("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
  } catch (err) {
    console.log(err);
    res.status(403).json("Error updating report");
  }
});
//GET

router.get("/", async (req, res) => {
  try {
    const allReports = await Report.find();
    res.status(200).json(allReports);
  } catch (err) {
    console.log(err);
    res.status(403).json("Error getting reports");
  }
});

router.get("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    res.status(200).json(report);
  } catch (err) {
    console.log(err);
    res.status(403).json("Error getting report");
  }
});

//DELETE

router.delete("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const deletedPost = await Report.findByIdAndDelete(reportId);
    await deletedPost.save();
    res.status(200).json("Report has beed deleted");
  } catch (err) {
    console.log(err);
    res.status(403).json("Error deleting report");
  }
});

module.exports = router;

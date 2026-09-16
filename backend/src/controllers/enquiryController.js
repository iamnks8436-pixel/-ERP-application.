const enquiryService = require('../services/enquiryService');

async function createEnquiry(req, res) {
  const enquiry = await enquiryService.createEnquiry({
    ...req.validated.body,
    createdById: req.user.id,
  });
  res.status(201).json({ success: true, data: enquiry });
}

async function getEnquiries(req, res) {
  const enquiries = await enquiryService.getEnquiries();
  res.json({ success: true, data: enquiries });
}

module.exports = { createEnquiry, getEnquiries };

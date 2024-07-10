const express = require('express');
const router = express.Router();
const {getLink ,getPaymentLink,webhook,retrieveAccount,getOnboardLink,sendEmail,runReportUser,runReportProducts}=require("../controller/index")

router.route('/get-link').get(getLink);
router.route('/payment').post(getPaymentLink);
router.route('/get-Account').post(retrieveAccount);
router.route('/get-onboarding-link').post(getOnboardLink);
router.route('/webhook').post(webhook);
router.route('/send-email').post(sendEmail);
router.route('/get-report-users').get(runReportUser);
router.route('/get-report-products').get(runReportProducts);
module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Proposal = require('../models/Proposal');
const Report = require('../models/Report');
const User = require('../models/User');

// @route   POST api/community/proposals
// @desc    Submit a proposal
// @access  Private (Member+)
router.post('/proposals', [auth, role('member')], async (req, res) => {
    try {
        const { type, targetId, targetType, title, description } = req.body;

        const newProposal = new Proposal({
            user: req.user.id,
            type,
            targetId,
            targetType,
            title,
            description
        });

        const proposal = await newProposal.save();
        res.json(proposal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/community/proposals
// @desc    Get all proposals
// @access  Private (Moderator+)
router.get('/proposals', [auth, role('moderator')], async (req, res) => {
    try {
        const proposals = await Proposal.find().populate('user', ['username', 'email']).sort({ createdAt: -1 });
        res.json(proposals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/community/proposals/:id
// @desc    Update proposal status (Approve/Reject)
// @access  Private (Moderator+)
router.patch('/proposals/:id', [auth, role('moderator')], async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        let proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ msg: 'Proposal not found' });

        if (proposal.status !== 'pending') {
            return res.status(400).json({ msg: 'Proposal already processed' });
        }

        proposal.status = status;
        proposal.reviewedBy = req.user.id;
        if (status === 'rejected') {
            proposal.rejectionReason = rejectionReason;
        }

        await proposal.save();

        // Gamification: Award points if approved
        if (status === 'approved') {
            const user = await User.findById(proposal.user);
            if (user) {
                user.points = (user.points || 0) + 10; // Award 10 points
                // Level up logic (simple example: level = floor(points / 100) + 1)
                user.level = Math.floor(user.points / 100) + 1;

                // Badges
                if (user.points >= 50 && !user.badges.includes('Contributor')) {
                    user.badges.push('Contributor');
                }
                if (user.points >= 200 && !user.badges.includes('Expert')) {
                    user.badges.push('Expert');
                }
                if (user.points >= 500 && !user.badges.includes('Master')) {
                    user.badges.push('Master');
                }

                await user.save();
            }
        }

        res.json(proposal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/community/reports
// @desc    Submit a report
// @access  Private (Member+)
router.post('/reports', [auth, role('member')], async (req, res) => {
    try {
        const { type, targetId, targetType, description } = req.body;

        const newReport = new Report({
            user: req.user.id,
            type,
            targetId,
            targetType,
            description
        });

        const report = await newReport.save();
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/community/reports
// @desc    Get all reports
// @access  Private (Moderator+)
router.get('/reports', [auth, role('moderator')], async (req, res) => {
    try {
        const reports = await Report.find().populate('user', ['username', 'email']).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/community/reports/:id
// @desc    Update report status
// @access  Private (Moderator+)
router.patch('/reports/:id', [auth, role('moderator')], async (req, res) => {
    try {
        const { status, resolutionNote } = req.body;

        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        report.status = status;
        report.resolvedBy = req.user.id;
        report.resolutionNote = resolutionNote;

        await report.save();
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

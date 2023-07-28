const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const {
  updateName,
  updateUserName,
  updateBio,
  updateDp,
  createGoal,
  addSubGoal,
  deleteGoal,
  deleteSubGoal,
  follow,
  unfollow,
  buyPremium,
  cancelPremium,
  updateSubGoal,
} = require('../helper/profile');

router.use(requireAuth);

router.put('/update-name/:id', async (req, res) => {
  updateName(req, res, User);
});

router.put('/update-username/:id', async (req, res) => {
  updateUserName(req, res, User);
});

router.put('/update-bio/:id', async (req, res) => {
  updateBio(req, res, User);
});

router.put('/update-dp/:id', async (req, res) => {
  updateDp(req, res, User);
});

router.post('/add-goal/:id', async (req, res) => {
  createGoal(req, res, Goal);
});

router.put('/update-goal/:id', async (req, res) => {
    updateGoal(req, res, User);
  });

router.post('/add-subgoal/:id', async (req, res) => {
  addSubGoal(req, res, User);
});

router.put('/update-subgoal/:id', async (req, res) => {
    updateSubGoal(req, res, User);
  });

router.delete('/delete-goal/:id', async (req, res) => {
  deleteGoal(req, res, User);
});

router.delete('/delete-subgoal/:id', async (req, res) => {
  deleteSubGoal(req, res, User);
});

router.put('/follow/:id', async (req, res) => {
  follow(req, res, User);
});

router.put('/unfollow/:id', async (req, res) => {
  unfollow(req, res, User);
});

router.put('/allow-follow/:id', async (req, res) => {
  allowFollow(req, res, User);
});

router.put('/disallow-follow/:id', async (req, res) => {
  disallowFollow(req, res, User);
});

router.put('/buy-premium/:id', async (req, res) => {
  buyPremium(req, res, User);
});

router.delete('/cancel-premium/:id', async (req, res) => {
  cancelPremium(req, res, User);
});

module.exports = router;
const router = require("express").Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
} = require("../controllers/users");

router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/me", updateProfile);
router.patch("/users/me/avatar", updateAvatar);

module.exports = router;

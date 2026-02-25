import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, name: "justscaled-backend" });
});

export default router;
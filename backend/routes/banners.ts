import { Router, Response } from "express";
import prisma from "../../database/prismaClient";
import { requireAdmin, AuthRequest } from "../middleware/requireAuth";

const router = Router();

router.get("/active", async (req, res: Response) => {
  try {
    const banner = await prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ banner });
  } catch (error) {
    console.error("Get active banner error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ banners });
  } catch (error) {
    console.error("Get banners error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, ctaText, ctaLink, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (isActive) {
      await prisma.banner.updateMany({ data: { isActive: false } });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        ctaText: ctaText || "Shop Now",
        ctaLink: ctaLink || "/products",
        isActive: !!isActive,
      },
    });

    return res.status(201).json({ banner });
  } catch (error) {
    console.error("Create banner error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.patch("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, subtitle, ctaText, ctaLink, isActive } = req.body;

    if (isActive) {
      await prisma.banner.updateMany({ data: { isActive: false } });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: { title, subtitle, ctaText, ctaLink, isActive },
    });

    return res.status(200).json({ banner });
  } catch (error) {
    console.error("Update banner error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.banner.delete({ where: { id } });
    return res.status(200).json({ message: "Banner deleted" });
  } catch (error) {
    console.error("Delete banner error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
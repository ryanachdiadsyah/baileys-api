import type { RequestHandler } from "express";
import { logger } from "@/shared";
import { getSession } from "@/whatsapp";
import { makePhotoURLHandler } from "./misc";
import { prisma } from "@/db";

export const list: RequestHandler = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const { cursor = undefined, limit = 25, search } = req.query;
		const groups = await prisma.contact.findMany({
			cursor: cursor ? { pkId: Number(cursor) } : undefined,
			take: Number(limit),
			skip: cursor ? 1 : 0,
			where: { 
				id: { endsWith: "g.us" },
				sessionId,
				name: {
					contains: String(search),
					mode: 'insensitive',
				}
		 	},
		});

		res.status(200).json({
			data: groups,
			cursor:
				groups.length !== 0 && groups.length === Number(limit)
					? groups[groups.length - 1].pkId
					: null,
		});
	} catch (e) {
		const message = "An error occured during group list";
		logger.error(e, message);
		res.status(500).json({ error: message });
	}
};

export const find: RequestHandler = async (req, res) => {
	try {
		const { sessionId, jid } = req.params;
		const session = getSession(sessionId)!;
		const data = await session.groupMetadata(jid);
		res.status(200).json(data);
	} catch (e) {
		const message = "An error occured during group metadata fetch";
		logger.error(e, message);
		res.status(500).json({ error: message });
	}
};

export const photo = makePhotoURLHandler("group");

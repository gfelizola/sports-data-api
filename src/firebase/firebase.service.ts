import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type App, applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import type { CollectionReference, Firestore } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import type { EnvSchema } from "../config/config.schema";

@Injectable()
export class FirebaseService {
	private app: App | null = null;
	private firestore: Firestore | null = null;

	constructor(private readonly configService: ConfigService<EnvSchema, true>) {}

	/**
	 * Retorna a instância do Firestore do banco configurado (sports-data).
	 * Em ambiente de teste sem credenciais, retorna null.
	 */
	getFirestore(): Firestore | null {
		if (this.firestore !== null) {
			return this.firestore;
		}
		this.ensureApp();
		if (this.app === null) {
			return null;
		}
		const databaseId = this.configService.get("FIREBASE_FIRESTORE_DATABASE_ID", {
			infer: true,
		});
		this.firestore = getFirestore(this.app, databaseId ?? "sports-data");
		return this.firestore;
	}

	/**
	 * Retorna a referência da coleção no banco sports-data.
	 * @throws se Firestore não estiver inicializado
	 */
	getCollection(name: string): CollectionReference {
		const db = this.getFirestore();
		if (db === null) {
			throw new Error("Firestore not initialized (missing credentials or test env)");
		}
		return db.collection(name);
	}

	private ensureApp(): void {
		if (this.app !== null) {
			return;
		}
		if (getApps().length > 0) {
			this.app = getApps()[0] as App;
			return;
		}
		const projectId = this.configService.get("FIREBASE_PROJECT_ID", { infer: true });
		const nodeEnv = this.configService.get("NODE_ENV", { infer: true });

		if (!projectId && nodeEnv === "test") {
			return;
		}
		if (!projectId) {
			try {
				this.app = initializeApp({ credential: applicationDefault() });
				return;
			} catch {
				return;
			}
		}

		const clientEmail = this.configService.get("FIREBASE_CLIENT_EMAIL", { infer: true });
		const privateKey = this.configService.get("FIREBASE_PRIVATE_KEY", { infer: true });

		if (clientEmail && privateKey) {
			const privateKeyUnescaped = privateKey.replace(/\\n/g, "\n");
			this.app = initializeApp({
				credential: cert({ projectId, clientEmail, privateKey: privateKeyUnescaped }),
			});
			return;
		}

		try {
			this.app = initializeApp({
				credential: applicationDefault(),
				projectId,
			});
		} catch {
			// sem credenciais em dev: não inicializa
		}
	}
}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/config.schema";
import { FirebaseModule } from "./firebase/firebase.module";
import { HealthModule } from "./health/health.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		FirebaseModule,
		HealthModule,
	],
})
export class AppModule {}

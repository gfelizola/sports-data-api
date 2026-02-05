import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FirebaseController } from "./firebase.controller";
import { FirebaseService } from "./firebase.service";

@Global()
@Module({
	imports: [ConfigModule],
	controllers: [FirebaseController],
	providers: [FirebaseService],
	exports: [FirebaseService],
})
export class FirebaseModule {}

import { AlertEngine } from '../../infrastructure/alerts/AlertEngine';
import { EngineFactory } from '../../infrastructure/engines/EngineFactory';

export class EvaluateAlertRulesUseCase {
  async execute(connectionId: number): Promise<void> {
    const engine = await EngineFactory.createById(connectionId);
    const telemetry = await engine.collectTelemetry();
    await AlertEngine.evaluate(connectionId, telemetry);
  }
}

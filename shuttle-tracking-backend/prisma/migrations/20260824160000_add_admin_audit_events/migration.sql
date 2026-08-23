BEGIN;

CREATE TABLE "admin_audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID,
    "actor_username" VARCHAR(50) NOT NULL,
    "actor_role" VARCHAR(30) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "target_type" VARCHAR(30) NOT NULL,
    "target_id" VARCHAR(50),
    "outcome" VARCHAR(20) NOT NULL,
    "response_status" INTEGER NOT NULL,
    "request_id" VARCHAR(50) NOT NULL,
    "occurred_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admin_audit_events_actor_user_id_fkey"
        FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "admin_audit_events_action_check" CHECK ("action" IN (
        'vehicle.create', 'vehicle.update', 'vehicle.delete',
        'route.create', 'route.update', 'route.delete',
        'stop.create', 'stop.update', 'stop.delete',
        'route_stop.create', 'route_stop.replace', 'route_stop.delete',
        'device.create', 'device.update', 'device.delete', 'device.assign', 'device.unassign',
        'feedback.update', 'feedback.delete', 'feedback.restore'
    )),
    CONSTRAINT "admin_audit_events_target_type_check" CHECK ("target_type" IN (
        'vehicle', 'route', 'stop', 'route_stop', 'tracking_source', 'feedback'
    )),
    CONSTRAINT "admin_audit_events_outcome_check" CHECK ("outcome" IN ('success', 'denied', 'failure')),
    CONSTRAINT "admin_audit_events_response_status_check" CHECK ("response_status" BETWEEN 100 AND 599)
);

CREATE INDEX "admin_audit_events_occurred_at_idx"
    ON "admin_audit_events" ("occurred_at" DESC);
CREATE INDEX "admin_audit_events_action_occurred_at_idx"
    ON "admin_audit_events" ("action", "occurred_at" DESC);
CREATE INDEX "admin_audit_events_target_type_occurred_at_idx"
    ON "admin_audit_events" ("target_type", "occurred_at" DESC);
CREATE INDEX "admin_audit_events_actor_user_id_occurred_at_idx"
    ON "admin_audit_events" ("actor_user_id", "occurred_at" DESC);
CREATE INDEX "admin_audit_events_actor_username_occurred_at_idx"
    ON "admin_audit_events" ("actor_username", "occurred_at" DESC);
CREATE INDEX "admin_audit_events_outcome_occurred_at_idx"
    ON "admin_audit_events" ("outcome", "occurred_at" DESC);

COMMIT;

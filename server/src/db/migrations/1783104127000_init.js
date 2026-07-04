/* eslint-disable @typescript-eslint/no-var-requires */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createTable("feedback", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    category: {
      type: "text",
      notNull: true,
    },
    message: {
      type: "text",
      notNull: true,
    },
    email: {
      type: "text",
    },
    status: {
      type: "text",
      notNull: true,
      default: "open",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.addConstraint("feedback", "feedback_category_check", {
    check: "category in ('Product','Feature Request','UI/UX','Support','Billing','Other')",
  });
  pgm.addConstraint("feedback", "feedback_status_check", {
    check: "status in ('open','in_progress','resolved')",
  });

  pgm.createIndex("feedback", "created_at");
  pgm.createIndex("feedback", "category");
  pgm.createIndex("feedback", "status");

  pgm.createTable("admin_users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    email: {
      type: "text",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("admin_users");
  pgm.dropTable("feedback");
};

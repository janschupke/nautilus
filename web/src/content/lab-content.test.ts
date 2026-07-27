import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LAB_MODULE_QUESTION_IDS } from "./lab-module-question-ids";
import { REGISTERED_LAB_TOPIC_IDS } from "./lab-modules";
import { ALL_TOPIC_IDS, MANIFEST, findModuleIdForTopic } from "./manifest";
import { anyAnswerMatches } from "@/lib/normalize-answer";
import type { LabTopic } from "@/lib/types";

const TOPICS_ROOT = path.join(process.cwd(), "src/content/topics");

function topicFiles(): string[] {
  return fs
    .readdirSync(TOPICS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const dir = path.join(TOPICS_ROOT, entry.name);
      return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.join(dir, file));
    })
    .sort();
}

function loadTopics(): LabTopic[] {
  return topicFiles().map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw) as LabTopic;
  });
}

function flatQuestionLabel(topic: LabTopic, questionId: string): string {
  return `${topic.id}/${questionId}`;
}

describe("lab topic content", () => {
  const topics = loadTopics();

  it("loads every bundled topic with unique ids", () => {
    expect(topics.length).toBeGreaterThan(0);

    const ids = topics.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps topic JSON, manifest, loader, and sidebar question ids in sync", () => {
    const topicIds = topics.map((topic) => topic.id).sort();

    expect(REGISTERED_LAB_TOPIC_IDS).toStrictEqual(topicIds);
    expect([...ALL_TOPIC_IDS].sort()).toStrictEqual(topicIds);

    const manifestTopicIds = MANIFEST.modules
      .flatMap((module) => module.topics.map((topic) => topic.id))
      .sort();
    expect(manifestTopicIds).toStrictEqual(topicIds);

    for (const topic of topics) {
      expect(findModuleIdForTopic(topic.id)).not.toBeNull();
      expect(LAB_MODULE_QUESTION_IDS[topic.id]).toStrictEqual(
        topic.questions.map((question) => question.id),
      );
    }
  });

  it("has complete question metadata and non-blank answer keys", () => {
    const questionCount = topics.reduce(
      (total, topic) => total + topic.questions.length,
      0,
    );
    expect(questionCount).toBe(571);

    for (const topic of topics) {
      expect(topic.title.trim(), topic.id).not.toBe("");
      expect(topic.shortTitle.trim(), topic.id).not.toBe("");
      expect(topic.workdir.trim(), topic.id).toMatch(/^\/home\/isopod\/?/);
      expect(topic.intro.trim(), topic.id).not.toBe("");
      expect(topic.questions.length, topic.id).toBeGreaterThan(0);

      const ids = topic.questions.map((question) => question.id);
      expect(new Set(ids).size, topic.id).toBe(ids.length);

      for (const question of topic.questions) {
        const label = flatQuestionLabel(topic, question.id);
        expect(question.prompt.trim(), label).not.toBe("");
        expect(question.expectedOutput.trim(), label).not.toBe("");
        expect(question.solutionMarkdown.trim(), label).not.toBe("");
        for (const accepted of question.acceptedOutputs ?? []) {
          expect(accepted.trim(), label).not.toBe("");
        }
      }
    }
  });

  it("accepts every expected answer and accepted-output variant", () => {
    for (const topic of topics) {
      for (const question of topic.questions) {
        const label = flatQuestionLabel(topic, question.id);
        const accepted = [
          question.expectedOutput,
          ...(question.acceptedOutputs ?? []),
        ];
        for (const answer of accepted) {
          expect(
            anyAnswerMatches(answer, accepted, question.caseInsensitive),
            label,
          ).toBe(true);
        }
      }
    }
  });
});

import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ExpertiseType {
  Certificate = "certificate",
  Skill = "skill",
  Knowledge = "knowledge",
}

const expertiseType: ObjectType<ExpertiseType, ObjectType<"title">> = {
  [ExpertiseType.Certificate]: { title: "آموزش" },
  [ExpertiseType.Skill]: { title: "مهارت" },
  [ExpertiseType.Knowledge]: { title: "دانش فنی" },
};

const expertiseTypeOptions: { value: ExpertiseType; label: string }[] =
  getObjectEntries(expertiseType).map(([key, { title }]) => ({
    value: key,
    label: title,
  }));

export { ExpertiseType, expertiseType, expertiseTypeOptions };

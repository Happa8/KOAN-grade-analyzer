import { Box, Divider, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { VFC } from "react";
import { GradeTableType } from "../home";

type Props = {
  gradeData: GradeTableType;
};

const SubjectCard: VFC<Props> = ({ gradeData, ...props }) => {
  return (
    <Box borderWidth={"1px"} p={4} borderRadius="lg">
      <VStack align={"start"} spacing={1}>
        <Text fontSize={"sm"} color={"gray.500"}>
          {gradeData.acquireYear} - {gradeData.acquireSemester}
        </Text>
        <Text fontWeight={""}>{gradeData.subjectName}</Text>
        <Text fontSize={"xs"} color={"gray.500"}>
          区分：{gradeData.subjectGenre}
        </Text>
        <Text fontSize={"xs"} color={"gray.500"}>
          小区分：{gradeData.subjectSubGenre}
        </Text>
        <Divider my={4} />
        <HStack spacing={8}>
          <HStack align={"baseline"} spacing={4}>
            <Text fontSize={"xs"} color={"gray.500"}>
              単位数
            </Text>
            <Text fontSize={"xl"}>{gradeData.credit}</Text>
          </HStack>
          <HStack align={"baseline"} spacing={4}>
            <Text fontSize={"xs"} color={"gray.500"}>
              評点
            </Text>
            <Text fontSize={"xl"}>{gradeData.grade}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SubjectCard;

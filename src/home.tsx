import {
  Box,
  Center,
  SimpleGrid,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Link,
  Divider,
  AccordionIcon,
} from "@chakra-ui/react";
import { VFC, useState, ChangeEvent, useEffect } from "react";
import { convert, detect, Encoding } from "encoding-japanese";
import Card from "./components/Card";
import SubjectCard from "./components/SubjectCard";
import SubjectList, { semesterToNumber } from "./components/SubjectList";
import AdvancedGPA from "./components/AdvancedGPA";

export type GradeTableType = {
  studentCode: string;
  studentId: string;
  displaySetYear: string;
  displaySetSemester: string;
  No: number;
  subjectGenre: string;
  subjectSubGenre: string;
  subjectName: string;
  readingProgramSubject: string;
  gymnasticsSubject: string;
  credit: number;
  acquireYear: number;
  acquireSemester: string;
  grade: "S" | "A" | "B" | "C" | "F" | string;
  passOrFail: "合" | "否" | "認" | string;
};

type ValuesToArray<T extends Record<string | symbol | number, unknown>> = {
  [K in keyof T]: T[K][];
};

export type GradeTableArrayType = ValuesToArray<Partial<GradeTableType>>;

const parseJudgeString = `"学生所属コード","学籍番号","画面指定年度","画面指定学期","No.","科目詳細区分","科目小区分","開講科目名 ","リーディングプログラム科目","知のジムナスティックス科目","単位数","修得年度","修得学期","評語","合否"`;

export const gradeToGradePoint = (grade: string): number => {
  switch (grade) {
    case "Ｓ":
      return 4;
    case "Ａ":
      return 3;
    case "Ｂ":
      return 2;
    case "Ｃ":
      return 1;
    case "Ｆ":
    case "否":
    case "合":
    case "認":
      return 0;
    default:
      return 0;
  }
};

// 切り捨て計算
export const orgFloor = (value: number, base: number = 100): number => {
  return Math.floor(value * base) / base;
};

// 単位計算
export const calcCredit = ({
  gradeData,
  isTruryCreditNum = true,
  filterBlackList = {} as GradeTableArrayType,
  filterWhiteList = {} as GradeTableArrayType,
  startYearSemester = { year: 0, semester: "春学期" },
  endYearSemester = { year: 10000, semester: "冬学期" },
}: {
  gradeData: GradeTableType[];
  isTruryCreditNum?: boolean;
  filterBlackList?: GradeTableArrayType;
  filterWhiteList?: GradeTableArrayType;
  startYearSemester?: { year: number; semester: string };
  endYearSemester?: { year: number; semester: string };
}): number => {
  const creditSum = gradeData
    .filter((elm) => {
      if (isTruryCreditNum) {
        return elm.passOrFail == ("合" || "認");
      } else {
        return true;
      }
    })
    .filter((elm) => {
      if (startYearSemester.year > endYearSemester.year) {
        return false;
      }
      if (
        elm.acquireYear > startYearSemester.year &&
        elm.acquireYear < endYearSemester.year
      ) {
        return true;
      } else if (
        elm.acquireYear === startYearSemester.year &&
        elm.acquireYear === endYearSemester.year
      ) {
        if (
          semesterToNumber(elm.acquireSemester) >=
            semesterToNumber(startYearSemester.semester) &&
          semesterToNumber(elm.acquireSemester) <=
            semesterToNumber(endYearSemester.semester)
        ) {
          return true;
        } else {
          return false;
        }
      } else if (
        elm.acquireYear === startYearSemester.year &&
        semesterToNumber(elm.acquireSemester) >=
          semesterToNumber(startYearSemester.semester)
      ) {
        return true;
      } else if (
        elm.acquireYear === endYearSemester.year &&
        semesterToNumber(elm.acquireSemester) <=
          semesterToNumber(endYearSemester.semester)
      ) {
        return true;
      } else {
        return false;
      }
    })
    .filter((elm) => {
      if (
        filterWhiteList !== undefined &&
        !!Object.keys(filterWhiteList).length
      ) {
        const keys: (keyof GradeTableType)[] = Object.keys(
          filterWhiteList
        ) as (keyof GradeTableType)[];
        const j = keys.reduce((sum, e) => {
          if (filterWhiteList !== undefined) {
            return (
              sum &&
              (filterWhiteList[e] as Array<keyof GradeTableType>).indexOf(
                elm[e] as never
              ) != -1
            );
          } else {
            return sum && true;
          }
        }, true);
        return j;
      } else {
        return true;
      }
    })
    .filter((elm) => {
      if (
        filterBlackList !== undefined &&
        !!Object.keys(filterBlackList).length
      ) {
        const keys: (keyof GradeTableType)[] = Object.keys(
          filterBlackList
        ) as (keyof GradeTableType)[];
        const j = keys.reduce((sum, e) => {
          if (filterBlackList !== undefined) {
            return (
              sum &&
              (filterBlackList[e] as Array<keyof GradeTableType>).indexOf(
                elm[e] as never
              ) == -1
            );
          } else {
            return sum && true;
          }
        }, true);
        return j;
      } else {
        return true;
      }
    })
    .reduce((sum, elm) => sum + elm.credit, 0);
  return creditSum;
};

// GPA計算
export const calcGPA = ({
  gradeData,
  filterBlackList = {} as GradeTableArrayType,
  filterWhiteList = {} as GradeTableArrayType,
  startYearSemester = { year: 0, semester: "春学期" },
  endYearSemester = { year: 10000, semester: "冬学期" },
}: {
  gradeData: GradeTableType[];
  filterBlackList?: GradeTableArrayType;
  filterWhiteList?: GradeTableArrayType;
  startYearSemester?: { year: number; semester: string };
  endYearSemester?: { year: number; semester: string };
}): number => {
  const GP = gradeData
    .filter((elm) => elm.subjectSubGenre !== "他学科・専攻・教免等科目")
    .filter((elm) => elm.grade !== ("合" || "否" || "認"))
    .filter((elm) => {
      if (startYearSemester.year > endYearSemester.year) {
        return false;
      }
      if (
        elm.acquireYear > startYearSemester.year &&
        elm.acquireYear < endYearSemester.year
      ) {
        return true;
      } else if (
        elm.acquireYear === startYearSemester.year &&
        elm.acquireYear === endYearSemester.year
      ) {
        if (
          semesterToNumber(elm.acquireSemester) >=
            semesterToNumber(startYearSemester.semester) &&
          semesterToNumber(elm.acquireSemester) <=
            semesterToNumber(endYearSemester.semester)
        ) {
          return true;
        } else {
          return false;
        }
      } else if (
        elm.acquireYear === startYearSemester.year &&
        semesterToNumber(elm.acquireSemester) >=
          semesterToNumber(startYearSemester.semester)
      ) {
        return true;
      } else if (
        elm.acquireYear === endYearSemester.year &&
        semesterToNumber(elm.acquireSemester) <=
          semesterToNumber(endYearSemester.semester)
      ) {
        return true;
      } else {
        return false;
      }
    })
    .filter((elm) => {
      if (
        filterWhiteList !== undefined &&
        !!Object.keys(filterWhiteList).length
      ) {
        const keys: (keyof GradeTableType)[] = Object.keys(
          filterWhiteList
        ) as (keyof GradeTableType)[];
        const j = keys.reduce((sum, e) => {
          if (filterWhiteList !== undefined) {
            return (
              sum &&
              (filterWhiteList[e] as Array<keyof GradeTableType>).indexOf(
                elm[e] as never
              ) != -1
            );
          } else {
            return sum && true;
          }
        }, true);
        return j;
      } else {
        return true;
      }
    })
    .filter((elm) => {
      if (
        filterBlackList !== undefined &&
        !!Object.keys(filterBlackList).length
      ) {
        const keys: (keyof GradeTableType)[] = Object.keys(
          filterBlackList
        ) as (keyof GradeTableType)[];
        const j = keys.reduce((sum, e) => {
          if (filterBlackList !== undefined) {
            return (
              sum &&
              (filterBlackList[e] as Array<keyof GradeTableType>).indexOf(
                elm[e] as never
              ) == -1
            );
          } else {
            return sum && true;
          }
        }, true);
        return j;
      } else {
        return true;
      }
    })
    .reduce((sum, elm) => sum + elm.credit * gradeToGradePoint(elm.grade), 0);
  const GPA = orgFloor(
    GP /
      calcCredit({
        gradeData: gradeData,
        isTruryCreditNum: false,
        startYearSemester: startYearSemester,
        endYearSemester: endYearSemester,
        filterBlackList: {
          ...filterBlackList,
          grade: ["合", "否", "認"],
          subjectSubGenre: ["他学科・専攻・教免等科目"].concat(
            filterBlackList.subjectSubGenre !== undefined
              ? (filterBlackList.subjectSubGenre.filter(
                  (elm) => elm !== undefined
                ) as string[])
              : []
          ),
        },
        filterWhiteList: filterWhiteList,
      })
  );
  return GPA;
};

// 区分・小区分検出
export const suspectSubjectGenre = (
  gradeData: GradeTableType[]
): { subjectGenre: string; subjectSubGenre: string[] }[] => {
  const subjectGenreSet = new Set(gradeData.map((elm) => elm.subjectGenre));
  let res: { subjectGenre: string; subjectSubGenre: string[] }[] = [];
  Array.from(subjectGenreSet).map((genre) => {
    const subGenreSet = new Set(
      gradeData
        .filter((elm) => elm.subjectGenre == genre)
        .map((elm) => elm.subjectSubGenre)
    );
    res.push({ subjectGenre: genre, subjectSubGenre: Array.from(subGenreSet) });
  });
  return res;
};

const Home: VFC = () => {
  const [rawData, setRawData] = useState<GradeTableType[]>([]);

  const fileOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (!e.target.files) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) return;
      const codes = new Uint8Array(e.target.result as ArrayBuffer);
      const encoding = detect(codes);
      const unicodeString = convert(codes, {
        to: "UNICODE",
        from: encoding as Encoding,
        type: "string",
      });
      const arraiedString = unicodeString
        .split(/\r\n|\n/)
        .filter((item) => item != "");
      const indexOfGradeTableStart =
        arraiedString.lastIndexOf(parseJudgeString);
      if (indexOfGradeTableStart == -1) {
        alert(
          "csvファイルの解析に失敗しました。正しいファイルを読み込ませてください。"
        );
        return;
      }
      const parsedData: GradeTableType[] = arraiedString
        .slice(indexOfGradeTableStart + 1)
        .map((item) => item.split(","))
        .map((item) => item.map((i) => i.slice(1, -1)))
        .map((item) => {
          return {
            studentCode: item[0],
            studentId: item[1],
            displaySetYear: item[2],
            displaySetSemester: item[3],
            No: parseInt(item[4]),
            subjectGenre: item[5],
            subjectSubGenre: item[6],
            subjectName: item[7],
            readingProgramSubject: item[8],
            gymnasticsSubject: item[9],
            credit: parseInt(item[10]),
            acquireYear: parseInt(item[11]),
            acquireSemester: item[12],
            grade: item[13],
            passOrFail: item[14],
          };
        });
      setRawData(parsedData);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  // useEffect(() => {
  //   console.log(suspectSubjectGenre(rawData));
  // }, [rawData]);

  return (
    <Box>
      <VStack w="100%">
        <Card isAccordion={false}>
          <VStack align={"start"}>
            <Heading>KOAN成績チェッカー</Heading>
            <Text color={"gray.500"} fontSize={"sm"}>
              KOANの単位修得状況出力機能によって出力されたCSVファイルを解析し、単位修得状況やGPAの計算を行うアプリです。科目区分毎の修得単位数の計算、特定の条件下でのGPA計算等が行えます。履修計画や、専門GPAの算出などに用いることができます。
            </Text>
            <Text fontSize={"sm"} fontWeight="bold">
              本システムの利用に伴い、直接的ないしは間接的に生じた損失等に対し、本システム及び製作者は何ら責任を負いません。本システムを利用したことにより生じる結果の全ては、使用者自身の責任と負担となります。くれぐれも自己判断の上ご利用ください。
            </Text>
            <Text color={"gray.500"} fontSize={"sm"}>
              成績ファイルの解析は全て使用者のブラウザ内で行われ、サーバーへと情報が送信されることはありません。本システムの全てのソースコードはGitHub上で公開しております。
            </Text>
            <Text color={"gray.500"} fontSize={"sm"}>
              更新履歴
              <br />
              2023/04/05　編入者用単位認定に対応
            </Text>
            <Divider />
            <Text color={"gray.500"} fontSize={"sm"}>
              ご要望・ご連絡・不具合報告等は happa.eight[at]gmail.com
              またはTwitterまで
              <br />
              製作：はっぱ(
              <Link href="https://twitter.com/happa_eight">@happa_eight</Link>)
            </Text>
            <Divider />
          </VStack>
        </Card>
        <Card sectionTitle="CSVファイル読み込み">
          <VStack align={"start"}>
            <Text fontSize={"sm"} color={"gray.500"}>
              KOAN(PC版)にログインし、【成績】→【🔍単位修得状況照会】へ移動。「過去を含めた全成績」にチェックを入れ、「ファイルに出力する」を押してCSVを生成。そのようにして生成されたCSVを以下のボタンよりアップロードしてください。
            </Text>
            <input type={"file"} accept="text/csv" onChange={fileOnChange} />
          </VStack>
        </Card>
        {rawData.length > 0 ? (
          <>
            <Card isAccordion={false}>
              <StatGroup>
                <Stat>
                  <StatLabel>通算GPA</StatLabel>
                  <StatNumber>{calcGPA({ gradeData: rawData })}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>修得済み単位数</StatLabel>
                  <StatNumber>{calcCredit({ gradeData: rawData })}</StatNumber>
                </Stat>
              </StatGroup>
            </Card>
            <Card sectionTitle="単位修得状況">
              <Center>
                <Table maxW={600} size={"sm"}>
                  <Tbody>
                    {suspectSubjectGenre(rawData).map((elm) => {
                      const subGenreTr = elm.subjectSubGenre.map((subGenre) => (
                        <Tr key={subGenre} color={"gray.500"}>
                          <Td>{subGenre}</Td>
                          <Td minW={20} isNumeric>
                            {calcCredit({
                              gradeData: rawData,
                              filterWhiteList: {
                                subjectGenre: [elm.subjectGenre],
                                subjectSubGenre: [subGenre],
                              },
                            })}
                          </Td>
                        </Tr>
                      ));
                      return (
                        <>
                          <Tr key={elm.subjectGenre}>
                            <Td>
                              {elm.subjectGenre == ""
                                ? "(区分なし)"
                                : elm.subjectGenre}
                            </Td>
                            <Td minW={20} isNumeric>
                              計
                              {calcCredit({
                                gradeData: rawData,
                                filterWhiteList: {
                                  subjectGenre: [elm.subjectGenre],
                                },
                              })}
                            </Td>
                          </Tr>
                          {subGenreTr}
                          <Tr>
                            <Td></Td>
                            <Td></Td>
                          </Tr>
                        </>
                      );
                    })}
                  </Tbody>
                </Table>
              </Center>
            </Card>

            <AdvancedGPA data={rawData} />
            <SubjectList data={rawData} />
            <Card sectionTitle="履修状況一覧（表）" isDefaultOpen={false}>
              <Table size={"sm"}>
                <Thead>
                  <Tr>
                    <Th>科目詳細区分</Th>
                    <Th>科目小区分</Th>
                    <Th>開講科目名</Th>
                    <Th>単位数</Th>
                    <Th>修得年度</Th>
                    <Th>修得学期</Th>
                    <Th>評語</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rawData.map((item) => (
                    <Tr key={item.No}>
                      <Td>{item.subjectGenre}</Td>
                      <Td>{item.subjectSubGenre}</Td>
                      <Td>{item.subjectName}</Td>
                      <Td>{item.credit}</Td>
                      <Td>{item.acquireYear}</Td>
                      <Td>{item.acquireSemester}</Td>
                      <Td>{item.grade}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Card>
          </>
        ) : (
          <></>
        )}
      </VStack>
    </Box>
  );
};

export default Home;

   <Table.Tr>
                <Table.Td border>첨부파일</Table.Td>
                <Table.Td border style={{ padding: 0, textAlign: "left" }}>
                  <Div position="relative">
                    <Button>
                      <label for="noticeFile" style={{ cursor: "pointer" }}>
                        파일선택
                      </label>
                    </Button>
                    <input
                      type="file"
                      id="noticeFile"
                      accept=".jpg,.png,.gif,.jpeg,.hwp,.gul,.zip,.rar,.doc,.docx,.xls,.ppt,.pptx,.pdf"
                      multiple
                      files
                      style={{
                        position: "absolute",
                        clip: "rect(0rem, 100rem, 2rem, 4.8rem)",
                        transform: "translateX(-4.8rem)",
                        overflow: "hidden",
                      }}
                    />
                  </Div>
                  <Div style={{ lineHeight: "1rem" }}>
                    첨부파일은
                    jpg,png,gif,jpeg,hwp,gul,zip,rar,doc,docx,xls,ppt,pptx,pdf
                    형태의 파일만 등록 가능합니다.​​
                    <br />
                    (5MB 이하의 파일만 가능합니다.)
                  </Div>
                </Table.Td>
              </Table.Tr>

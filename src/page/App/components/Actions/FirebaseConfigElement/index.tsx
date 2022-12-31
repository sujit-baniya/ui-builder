import { FC, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  Link,
  PaginationPreIcon,
  Popover,
  TextArea,
  WarningCircleIcon,
  getColor,
  useMessage,
} from "~/packages/components"
import {
  onActionConfigElementSubmit,
  onActionConfigElementTest,
} from "~/page/App/components/Actions/api"
import {
  FirebaseResource,
  FirebaseResourceInitial,
} from "~/redux/resource/firebaseResource"
import { Resource } from "~/redux/resource/resourceState"
import { RootState } from "~/store"
import { isCloudVersion, isURL } from "~/utils/typeHelper"
import { FirebaseConfigElementProps } from "./interface"
import {
  applyConfigItemLabelText,
  configItem,
  configItemTip,
  connectTypeStyle,
  container,
  divider,
  errorIconStyle,
  errorMsgStyle,
  footerStyle,
  labelContainer,
  optionLabelStyle,
  privateKeyItem,
} from "./style"

export const FirebaseConfigElement: FC<FirebaseConfigElementProps> = (
  props,
) => {
  const { onBack, resourceId, onFinished } = props

  const { t } = useTranslation()
  const message = useMessage()

  const { control, handleSubmit, getValues, formState } = useForm({
    mode: "onChange",
    shouldUnregister: true,
  })

  const findResource = useSelector((state: RootState) => {
    return state.resource.find((r) => r.resourceId === resourceId)
  })

  let content: FirebaseResource

  if (findResource === undefined) {
    content = FirebaseResourceInitial
  } else {
    content = (findResource as Resource<FirebaseResource>).content
  }

  const [testLoading, setTestLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleConnectionTest = () => {
    const data = getValues()

    try {
      const content = {
        databaseUrl: data.databaseUrl,
        projectID: data.projectID,
        privateKey: JSON.parse(data.privateKey),
      }

      onActionConfigElementTest(data, content, "firebase", setTestLoading)
    } catch (e) {
      message.error({
        content: t("editor.action.resource.db.invalid_private.key"),
      })
    }
  }

  return (
    <form
      onSubmit={onActionConfigElementSubmit(
        handleSubmit,
        resourceId,
        "firebase",
        onFinished,
        setSaving,
      )}
    >
      <div css={container}>
        <div css={divider} />
        <div css={configItem}>
          <div css={labelContainer}>
            <span css={applyConfigItemLabelText(getColor("red", "02"))}>*</span>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.db.label.name")}
            </span>
          </div>
          <Controller
            control={control}
            defaultValue={findResource?.resourceName ?? ""}
            rules={{
              required: true,
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                w="100%"
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                borderColor="techPurple"
                placeholder={t("editor.action.resource.db.placeholder.name")}
              />
            )}
            name="resourceName"
          />
        </div>
        <div css={configItemTip}>
          {t("editor.action.resource.restapi.tip.name")}
        </div>
        <Divider
          direction="horizontal"
          ml="24px"
          mr="24px"
          mt="8px"
          mb="8px"
          w="unset"
        />
        <div css={optionLabelStyle}>
          {t("editor.action.resource.db.title.general_option")}
        </div>
        <div css={configItem}>
          <div css={labelContainer}>
            <span css={applyConfigItemLabelText(getColor("red", "02"))}>*</span>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.db.label.firebase_database_url")}
            </span>
          </div>
          <Controller
            defaultValue={content.databaseUrl}
            control={control}
            rules={{
              required: t("editor.action.resource.error.invalid_url"),
              validate: (value: string) => {
                return isURL(value)
                  ? true
                  : t("editor.action.resource.error.invalid_url")
              },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                w="100%"
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                borderColor="techPurple"
              />
            )}
            name="databaseUrl"
          />
        </div>
        <div css={configItemTip}>
          {formState.errors.databaseUrl && (
            <div css={errorMsgStyle}>
              <>
                <WarningCircleIcon css={errorIconStyle} />
                {formState.errors.databaseUrl.message}
              </>
            </div>
          )}
        </div>
        <div css={configItem}>
          <div css={labelContainer}>
            <span css={applyConfigItemLabelText(getColor("red", "02"))}>*</span>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.db.label.firebase_project_id")}
            </span>
          </div>
          <Controller
            defaultValue={content.projectID}
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                w="100%"
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                borderColor="techPurple"
              />
            )}
            name="projectID"
          />
        </div>
        <div css={privateKeyItem}>
          <Popover
            content={t("editor.action.resource.db.label.private_key_hover")}
            hasCloseIcon={false}
            trigger="hover"
            colorScheme="gray"
            showArrow={false}
          >
            <div css={labelContainer}>
              <span css={applyConfigItemLabelText(getColor("red", "02"))}>
                *
              </span>
              <span css={applyConfigItemLabelText(getColor("grayBlue", "02"))}>
                {t("editor.action.resource.db.label.private_key")}
              </span>
            </div>
          </Popover>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            defaultValue={
              content.privateKey && JSON.stringify(content.privateKey)
            }
            render={({ field: { value, onChange, onBlur } }) => (
              <TextArea
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                autoSize
                placeholder={t(
                  "editor.action.resource.db.placeholder.private_key",
                )}
              />
            )}
            name="privateKey"
          />
        </div>
        <div css={configItemTip}>
          <Link
            href="https://firebase.google.com/docs/admin/setup"
            target="_blank"
          >
            {t("editor.action.resource.db.tip.private_key")}
          </Link>
        </div>
        {isCloudVersion && (
          <>
            <div css={configItem}>
              <div css={labelContainer}>
                <span
                  css={applyConfigItemLabelText(getColor("grayBlue", "02"))}
                >
                  {t("editor.action.resource.db.label.connect_type")}
                </span>
              </div>
              <span css={connectTypeStyle}>
                {t("editor.action.resource.db.tip.connect_type")}
              </span>
            </div>
          </>
        )}
      </div>
      <div css={footerStyle}>
        <Button
          leftIcon={<PaginationPreIcon />}
          variant="text"
          colorScheme="gray"
          type="button"
          onClick={onBack}
        >
          {t("back")}
        </Button>
        <ButtonGroup spacing="8px">
          <Button
            colorScheme="gray"
            loading={testLoading}
            disabled={!formState.isValid}
            type="button"
            onClick={handleConnectionTest}
          >
            {t("editor.action.form.btn.test_connection")}
          </Button>
          <Button
            colorScheme="techPurple"
            disabled={!formState.isValid}
            loading={saving}
            type="submit"
          >
            {t("editor.action.form.btn.save_changes")}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  )
}

FirebaseConfigElement.displayName = "FirebaseConfigElement"

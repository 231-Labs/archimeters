import BaseTemplate from '../../../templates/BaseTemplate';
import DefaultTemplate from '../../../templates/DefaultTemplate';

interface PreviewPageProps {
  workName: string;
  description: string;
  price: string;
  name: string;
  social: string;
  intro: string;
  imageUrl: string;
  parameters: Record<string, any>;
  previewParams: Record<string, any>;
  onParameterChange: (key: string, value: string | number) => void;
  onMint: () => void;
}

export const PreviewPage = ({
  workName,
  description,
  price,
  name,
  social,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint
}: PreviewPageProps) => {
  return (
    <BaseTemplate
      workName={workName}
      description={description}
      price={price}
      author={name}
      social={social}
      intro={intro}
      imageUrl={imageUrl}
      parameters={parameters}
      previewParams={previewParams}
      onParameterChange={onParameterChange}
      onMint={onMint}
    >
      <DefaultTemplate
        workName={workName}
        description={description}
        price={price}
        author={name}
        social={social}
        intro={intro}
        imageUrl={imageUrl}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={onParameterChange}
        onMint={onMint}
      />
    </BaseTemplate>
  );
}; 
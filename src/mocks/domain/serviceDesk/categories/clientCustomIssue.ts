import { DbSubCategory } from "@/feature/serviceDesk/category";

const clientCustomIssueCategoryMock = [
  {
    category_id: 112,
    category_name: {
      en: "Client-Specific Issue 1",
      es: "Problema específico del cliente 1",
      fr: "Problème spécifique au client 1",
      ko: "고객사 특화 문제 1",
    },
    category_description: {
      en: "Request support for client-specific issues that are unique to your organization.",
      es: "Solicite asistencia para problemas específicos del cliente que sean propios de su organización.",
      fr: "Demandez une assistance pour les problèmes spécifiques au client propres à votre organisation.",
      ko: "고객사 특화 문제 1에 대해 해결을 요청합니다.",
    },
    category_request_template: {
      en: "Please provide details about the issue you are experiencing.",
      es: "Proporcione detalles sobre el problema que está experimentando.",
      fr: "Veuillez fournir des détails sur le problème rencontré.",
      ko: "발생한 문제에 대한 정보를 포함하여 요청해주세요.",
    },
    category_index: 11,
    category_active: true,
    default_priority: "high",
    default_risk_level: null,
    default_sla_days: 2,
  },
  {
    category_id: 113,
    category_name: {
      en: "Client-Specific Issue 2",
      es: "Problema específico del cliente 2",
      fr: "Problème spécifique au client 2",
      ko: "고객사 특화 문제 2",
    },
    category_description: {
      en: "Request support for custom operational or system-related issues defined by your client.",
      es: "Solicite asistencia para problemas operativos o del sistema personalizados definidos por su cliente.",
      fr: "Demandez une assistance pour des problèmes opérationnels ou système personnalisés définis par votre client.",
      ko: "고객사 특화 문제 2에 대해 해결을 요청합니다.",
    },
    category_request_template: {
      en: "Please describe the issue and any relevant context.",
      es: "Describa el problema y cualquier contexto relevante.",
      fr: "Veuillez décrire le problème et tout contexte pertinent.",
      ko: "발생한 문제에 대한 정보를 포함하여 요청해주세요.",
    },
    category_index: 12,
    category_active: true,
    default_priority: "urgent",
    default_risk_level: "medium",
    default_sla_days: 5,
  },
  {
    category_id: 114,
    category_name: {
      en: "Client-Specific Issue 3",
      es: "Problema específico del cliente 3",
      fr: "Problème spécifique au client 3",
      ko: "고객사 특화 문제 3",
    },
    category_description: {
      en: "Request support for additional client-defined issues not covered by standard categories.",
      es: "Solicite asistencia para problemas adicionales definidos por el cliente que no estén cubiertos por las categorías estándar.",
      fr: "Demandez une assistance pour des problèmes supplémentaires définis par le client et non couverts par les catégories standard.",
      ko: "고객사 특화 문제 3에 대해 해결을 요청합니다.",
    },
    category_request_template: {
      en: "Please include any information that may help with investigation or resolution.",
      es: "Incluya cualquier información que ayude a la investigación o resolución.",
      fr: "Veuillez inclure toute information utile à l’investigation ou à la résolution.",
      ko: "발생한 문제에 대한 정보를 포함하여 요청해주세요.",
    },
    category_index: 13,
    category_active: false,
    default_priority: "medium",
    default_risk_level: "critical",
    default_sla_days: 2,
  },
] satisfies DbSubCategory[];

export default clientCustomIssueCategoryMock;

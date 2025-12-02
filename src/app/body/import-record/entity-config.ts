export const ENTITY_CONFIG: { [key: string]: any } = {
    IntellectualEntities: {
        MONOGRAPH: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'isbn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        MONOGRAPH_VOLUME: {
            title_part: [
                {
                    name: 'monographTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'volumeTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'isbn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        PERIODICAL: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        PERIOCAL_VOLUME: {
            title_part: [
                {
                    name: 'periodicalTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'volumeTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        PERIODICAL_ISSUE: {
            title_part: [
                {
                    name: 'periodicalTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'volumeTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issueTitle',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        ANALYTICAL: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'sourceDocument',
                    type: 'SOURCE_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        THESIS: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'degreeAwardingInstitution',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        OTHER_ENTITY: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'isbn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
        SOUND_COLLECTION: {
            title_part: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'subTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            identifiers: [
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
            ],
            other: [
                {
                    name: 'documentType',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'digitalBorn',
                    type: 'boolean',
                    controlType: 'checkbox',
                    required: false,
                },
                {
                    name: 'primaryOriginator',
                    type: 'PRIMARY_ORIGINATOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'otherOriginator',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
            digital_document: [
                {
                    name: 'digitalDocument',
                    type: 'DIGITAL_DOCUMENT',
                    controlType: 'nested',
                    required: true,
                },
            ],
        },
    },
    IEPodtypy: {
        PRIMARY_ORIGINATOR: {
            default: [
                {
                    name: 'type',
                    type: 'author/event/corporation',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'value',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
        },
        PUBLICATION: {
            default: [
                {
                    name: 'publisher',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'place',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'year',
                    type: 'integer',
                    controlType: 'input',
                    required: false,
                },
            ],
        },
        SOURCE_DOCUMENT: {
            default: [
                {
                    name: 'title',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'volumeTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issueTitle',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'ccnb',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'isbn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'issn',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'otherId',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'publication',
                    type: 'PUBLICATION',
                    controlType: 'nested',
                    required: false,
                },
            ],
        },
        DIGITAL_DOCUMENT: {
            default: [
                {
                    name: 'archiverId',
                    type: 'integer',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'urnNbn',
                    type: 'URN_NBN',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'financed',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'contractNumber',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'technicalMetadata',
                    type: 'TECHNICAL_METADATA',
                    controlType: 'nested',
                    required: false,
                },
            ],
        },
        TECHNICAL_METADATA: {
            default: [
                {
                    name: 'format',
                    type: 'FORMAT',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'extent',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'resolution',
                    type: 'RESOLUTION',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'compression',
                    type: 'COMPRESSION',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'color',
                    type: 'COLOR',
                    controlType: 'nested',
                    required: false,
                },
                {
                    name: 'iccProfile',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'pictureSize',
                    type: 'PICTURE_SIZE',
                    controlType: 'nested',
                    required: false,
                },
            ],
        },
        FORMAT: {
            default: [
                {
                    name: 'version',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'value',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
        },
        RESOLUTION: {
            default: [
                {
                    name: 'horizontal',
                    type: 'integer',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'vertical',
                    type: 'integer',
                    controlType: 'input',
                    required: true,
                },
            ],
        },
        COMPRESSION: {
            default: [
                {
                    name: 'ratio',
                    type: 'double',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'value',
                    type: 'string',
                    controlType: 'input',
                    required: true,
                },
            ],
        },
        COLOR: {
            default: [
                {
                    name: 'model',
                    type: 'string',
                    controlType: 'input',
                    required: false,
                },
                {
                    name: 'depth',
                    type: 'integer',
                    controlType: 'input',
                    required: false,
                },
            ],
        },
        PICTURE_SIZE: {
            default: [
                {
                    name: 'width',
                    type: 'integer',
                    controlType: 'input',
                    required: true,
                },
                {
                    name: 'height',
                    type: 'integer',
                    controlType: 'input',
                    required: true,
                },
            ],
        },
    },
};

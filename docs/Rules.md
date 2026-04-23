## Scope

Czidlo is a system for the permanent identification of digital documents of Czech cultural heritage. The system is operated by the **National Library of the Czech Republic**, which administers and cooperates with other institutions. This cooperation is an essential condition for the successful functioning of the entire system.

**Purpose of the Czidlo system:**

- used by libraries and other institutions concerned with Czech cultural heritage for the purpose of permanently identifying digital documents. 

- to secure permanent online access to digital documents; it addresses the problem of instability and the constant change of URL addresses and serves as a means of ensuring the credibility and authenticity of citations.

## Structure
- Czidlo consists of rules, technical subsystems (e.g., resolver, API, OAI-PMH data provider), and URN:NBN identifiers with the Czech namespace for digital documents and their associated metadata (urn:nbn:cz)
- The National Library of the Czech Republic stands as the central authority over the URN:NBN standard for the Czech Republic.
- The main representative of the central authority is the resolver curator (as coordinator of the overall system), who provides potential registrants with information and guidance on the system´s requirements and rules. The curator also determines whether proposed digital documents comply with criteria for the status of cultural heritage.  

**Contact via:**  urnnbn@nkp.cz.

**Collaborating institutions participating in the Czidlo system fulfill the following roles:**

- **Registrant** - a document owner who requests a URN:NBN identifier for their documents and is responsible for complying with the system's rules and requirements.
- **Archiver** - an institution that permanently archives digital documents in repositories
- **Administrator of a digital library** - an institution that displays digital documents for users, and may also act on behalf of other contributing institutions or registrants

The object of identification is a digital document that is considered part of Czech cultural heritage. This practice is a non-commercial activity that ensures permanent access for users. Digital documents remain unchanged in terms of content; if their content is edited or updated, identification does not apply. The Czidlo system is currently used for the identification of recently digitized documents as part of various ongoing digitization projects.

### Registrants 

- Potential registrants interested in participating in the Czidlo system may include any registered library in the Czech Republic. Other interested institutions are advised to contact the curator to determine whether  their documents are eligible to qualify as Czech cultural heritage. 
- Each registrant is obligated to adhere to all rules of the Czidlo system. 
- Any institution interested in participating in the Czidlo system must first contact the resolver curator (urnnbn@nkp.cz). The curator will introduce and explain all detailed rules and technical procedures of the system.
- A registrant may be represented by an external company (e.g., during digitization), or cooperate with other institutions managing a digital repository or digital library

### Archivists 
- The role of an archivist is fulfilled by a library or other institution that ensures the archiving of digital documents.
- Registrants are not required to digitally archive their documents, as other institutions might take responsibility for managing digital archiving on their behalf

## Rules and requirements for registrants

1. The assignment of the URN:NBN must be completed upon digitization  (production of the Archival Information Package (AIP) and the Dissemination Information Package (DIP)). The registrant then initiates the identification process, during which the Czidlo API system interacts with the digitization software.
2. To complete the identification process, the registrant is required to submit bibliographical and technical metadata associated with the digital document.
3. The issued URN:NBN identifier must be included in the Archival and Dissemination Information Packages. The AIP is subsequently preserved in a digital repository, and the DIP is submitted to the digital library.
4. Information packages should not be submitted to significant changes. If there is a significant change to an information package, the registrant is required to request a new URN:NBN identifier. Changes may constitute alterations, such as the splitting of documents, the merging of documents, or changes to identification data. Changes are prone to updates; however, appearing mistakes (e.g., typos) require the assistance and consultation of a curator.
5. Digital libraries are required to visibly display the URN:NBN identifier within the metadata section.
6. Digital libraries are required to map the URN:NBN identifiers to metadata for the OAI provider.
7. After displaying the document in the digital library, the registrant is required to contact the curator to arrange harvesting of the current URLs via the OAI-PMH protocol.
8. Prior to registration, the curator will provide information and explain the rules and requirements to potential registrants. In case of any uncertainty, it is necessary to contact the curator.
9. All necessary instructions are contained in a [certified procedure document](https://standardy.ndk.cz/ndk/archivace/Certifik_metodika_urnnbn_2018.pdf)

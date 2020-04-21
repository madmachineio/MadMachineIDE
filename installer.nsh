module.exports = {
    template: "!macro preInit\n" +
        "\tSetRegView 64\n" +
        "\tWriteRegExpandStr HKLM \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$SystemDrive\\$dirName\"\n" +
        "\tWriteRegExpandStr HKCU \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$SystemDrive\\$dirName\"\n" +
        "\tSetRegView 32\n" +
        "\tWriteRegExpandStr HKLM \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$SystemDrive\\$dirName\"\n" +
        "\tWriteRegExpandStr HKCU \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$SystemDrive\\$dirName\"\n" +
        "!macroend"
}